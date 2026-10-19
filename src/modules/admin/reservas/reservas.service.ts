import { HttpException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager, In, LessThan, Brackets } from 'typeorm';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { CreateReservaManualDto } from './dto/create-reserva-manual.dto';
import { Reserva } from './entities/reserva.entity';
import { ReservaParticipante } from './entities/reserva-participante.entity';
import { Participacion } from '../participaciones/entities/participacion.entity';
import { Perfil } from '../perfiles/entities/perfile.entity';
import { Stand } from '../stands/entities/stand.entity';
import { Evento } from '../eventos/entities/evento.entity';
import { Piso } from '../pisos/entities/piso.entity';
import { EstadoReserva } from '../../../common/enums/estado-reserva.enum';
import { EstadoPerfil } from '../../../common/enums/estado-perfil.enum';
import { EstadoEvento } from '../../../common/enums/estado-evento.enum';
import { CategoriaTipo } from '../../../common/enums/categoria-tipo.enum';
import { TipoParticipante } from '../../../common/enums/tipo-participante.enum';

const ACTIVAS = [EstadoReserva.PENDIENTE_PAGO, EstadoReserva.CONFIRMADA];
const EVENTOS_ABIERTOS = [EstadoEvento.PUBLICADO, EstadoEvento.INSCRIPCIONES_ABIERTAS];
// TEMPORAL: true = selección abierta para todos los perfiles aprobados, sin importar la fecha
const SELECCION_SIEMPRE_ABIERTA = true;

const REGLAS_POR_DEFECTO =
  'Reglas y condiciones de participación.\n\n' +
  '1. Una vez seleccionada la mesa, tienes 24 horas para realizar el pago. ' +
  'Si el pago no se realiza dentro de ese plazo, la organización podrá liberar la mesa y ponerla nuevamente disponible.\n' +
  '2. Cada expositor puede reservar una sola mesa por edición.\n' +
  '3. Las mesas compartidas solo están disponibles para artistas con perfil aprobado.\n' +
  '4. El pago se coordina por WhatsApp con la organización.';

const fallo = (status: number, code: string, message: string) =>
  new HttpException({ statusCode: status, code, message }, status);

@Injectable()
export class ReservasService {
  constructor(private readonly dataSource: DataSource) {}

  // ───────────── helpers ─────────────

  private async eventoActual(m: EntityManager): Promise<Evento> {
    const ev = await m.getRepository(Evento).findOne({
      where: { estado: In(EVENTOS_ABIERTOS) },
      order: { id: 'DESC' },
    });
    if (!ev) throw fallo(404, 'EVENTO_NO_DISPONIBLE', 'No hay un evento abierto');
    return ev;
  }

  private async perfilAprobado(m: EntityManager, usuarioId: string): Promise<Perfil> {
    const perfil = await m.getRepository(Perfil).findOne({ where: { usuarioId } });
    if (!perfil) throw fallo(404, 'PERFIL_NO_ENCONTRADO', 'No se encontró tu perfil');
    if (perfil.estado !== EstadoPerfil.APROBADO) {
      throw fallo(403, 'PERFIL_NO_APROBADO', 'Tu perfil aún no está aprobado');
    }
    return perfil;
  }

  private async liberarVencidas(m: EntityManager) {
    await m.getRepository(Reserva).update(
      { estado: EstadoReserva.PENDIENTE_PAGO, venceEn: LessThan(new Date()) },
      { estado: EstadoReserva.VENCIDA, motivoLiberacion: 'Vencida por falta de pago' },
    );
  }

  private reservaActivaDePerfil(m: EntityManager, perfilId: number, eventoId: number) {
    return m
      .getRepository(Reserva)
      .createQueryBuilder('r')
      .innerJoin('r.participantes', 'rp')
      .innerJoin('r.stand', 's')
      .innerJoin('s.piso', 'p')
      .where('rp.perfil_id = :perfilId', { perfilId })
      .andWhere('p.evento_id = :eventoId', { eventoId })
      .andWhere('r.estado IN (:...act)', { act: ACTIVAS })
      .getOne();
  }

  private async participacion(m: EntityManager, perfilId: number, eventoId: number) {
    await m
      .createQueryBuilder()
      .insert()
      .into(Participacion)
      .values({ perfilId, eventoId })
      .orIgnore()
      .execute();
    return m.getRepository(Participacion).findOneOrFail({ where: { perfilId, eventoId } });
  }

  private async cargarReserva(m: EntityManager, id: number) {
    const r = await m
      .getRepository(Reserva)
      .createQueryBuilder('r')
      .setLock('pessimistic_write')
      .where('r.id = :id', { id })
      .getOne();
    if (!r) throw fallo(404, 'RESERVA_NO_EXISTE', 'La reserva no existe');
    return r;
  }

  private bloquearMesa(m: EntityManager, standId: number) {
    return m
      .getRepository(Stand)
      .createQueryBuilder('s')
      .setLock('pessimistic_write')
      .where('s.id = :id', { id: standId })
      .getOne();
  }

  private async mesaLibre(m: EntityManager, standId: number) {
    const otra = await m
      .getRepository(Reserva)
      .findOne({ where: { standId, estado: In(ACTIVAS) } });
    return !otra;
  }

  private async validarCompanero(
    m: EntityManager,
    stand: Stand,
    perfil: Perfil,
    eventoId: number,
    companeroId?: number,
  ) {
    if (!companeroId) return null;
    if (stand.categoria !== CategoriaTipo.ILUSTRADORES) {
      throw fallo(422, 'COMPANERO_NO_PERMITIDO', 'Solo las mesas de artistas admiten compañero');
    }
    if (companeroId === perfil.id) {
      throw fallo(422, 'COMPANERO_INVALIDO', 'No puedes agregarte a ti mismo');
    }
    const c = await m.getRepository(Perfil).findOne({ where: { id: companeroId } });
    if (!c || c.estado !== EstadoPerfil.APROBADO || c.categoria !== CategoriaTipo.ILUSTRADORES) {
      throw fallo(422, 'COMPANERO_INVALIDO', 'Ese perfil no está aprobado como artista');
    }
    if (await this.reservaActivaDePerfil(m, c.id, eventoId)) {
      throw fallo(422, 'COMPANERO_INVALIDO', 'Ese perfil ya tiene mesa');
    }
    return c;
  }

  // ───────────── reglas ─────────────

  async reglas(usuarioId: string) {
    const m = this.dataSource.manager;
    const ev = await this.eventoActual(m);
    const perfil = await this.perfilAprobado(m, usuarioId);
    const part = await m.getRepository(Participacion).findOne({
      where: { perfilId: perfil.id, eventoId: ev.id },
    });
    return {
      texto: ev.reglasTexto || REGLAS_POR_DEFECTO,
      version: ev.reglasVersion,
      horasPago: ev.horasPago,
      aceptadas: !!part?.reglasAceptadasEn && part.reglasVersion === ev.reglasVersion,
    };
  }

  async aceptarReglas(usuarioId: string) {
    const m = this.dataSource.manager;
    const ev = await this.eventoActual(m);
    const perfil = await this.perfilAprobado(m, usuarioId);
    const part = await this.participacion(m, perfil.id, ev.id);
    part.reglasAceptadasEn = new Date();
    part.reglasVersion = ev.reglasVersion;
    await m.getRepository(Participacion).save(part);
    return { aceptadas: true, version: ev.reglasVersion };
  }

  // ───────────── mapa ─────────────

  async mapa(user: { id: string; rol: string }) {
    const m = this.dataSource.manager;
    const ev = await this.eventoActual(m);
    const perfil = user.rol === 'EXPOSITOR' ? await this.perfilAprobado(m, user.id) : null;
    await this.liberarVencidas(m);

    let stands = await m
      .getRepository(Stand)
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.sector', 'sec')
      .innerJoin('s.piso', 'p')
      .where('p.evento_id = :ev', { ev: ev.id })
      .orderBy('sec.id', 'ASC')
      .addOrderBy('s.codigo', 'ASC')
      .getMany();

    // El expositor solo ve las mesas de su categoría
    if (perfil) stands = stands.filter((s) => s.categoria === perfil.categoria);

    const reservas = await m
      .getRepository(Reserva)
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.participantes', 'rp')
      .innerJoin('r.stand', 's')
      .innerJoin('s.piso', 'p')
      .where('p.evento_id = :ev', { ev: ev.id })
      .andWhere('r.estado IN (:...act)', { act: ACTIVAS })
      .getMany();

    const porStand = new Map<number, Reserva>();
    reservas.forEach((r) => porStand.set(r.standId, r));

    const ahora = new Date();
    const sectores = new Map<number, { id: number; nombre: string; stands: any[] }>();

    for (const s of stands) {
      const r = porStand.get(s.id);
      let estado = 'DISPONIBLE';
      if (r) {
        const mia = !!perfil && r.participantes.some((p) => p.perfilId === perfil.id);
        estado = mia ? 'MIA' : 'OCUPADO';
      } else if (s.estado !== 'DISPONIBLE') {
        estado = 'OCUPADO';
      }
      const secId = s.sectorId ?? 0;
      if (!sectores.has(secId)) {
        sectores.set(secId, { id: secId, nombre: s.sector?.nombre ?? 'General', stands: [] });
      }
      // Nunca se revela quién reservó: solo el estado
      sectores.get(secId)!.stands.push({
        id: s.id,
        codigo: s.codigo,
        x: Number(s.posicionX),
        y: Number(s.posicionY),
        ancho: Number(s.ancho),
        alto: Number(s.alto),
        rotacion: s.rotacion,
        precio: Number(s.precio),
        categoria: s.categoria,
        estado,
        medidas: s.medidas ?? null,
        sillas: s.sillas ?? null,
        incluyeMerienda: s.incluyeMerienda,
        bajoTecho: s.bajoTecho,
        descripcion: s.descripcion ?? null,
      });
    }

    return {
      ahora: ahora.toISOString(),
      evento: {
        id: ev.id,
        nombre: ev.nombre,
        seleccionAbreEn: ev.seleccionAbreEn,
        abierta: SELECCION_SIEMPRE_ABIERTA || (!!ev.seleccionAbreEn && ev.seleccionAbreEn <= ahora),
        whatsappCanal: ev.whatsappCanal,
      },
      categoria: perfil?.categoria ?? null,
      sectores: [...sectores.values()],
    };
  }

  // ───────────── buscador de compañero ─────────────

  async buscarCompaneros(usuarioId: string, q: string) {
    const m = this.dataSource.manager;
    const ev = await this.eventoActual(m);
    const perfil = await this.perfilAprobado(m, usuarioId);
    const texto = (q || '').trim();
    if (texto.length < 2 || perfil.categoria !== CategoriaTipo.ILUSTRADORES) return [];

    const lista = await m
      .getRepository(Perfil)
      .createQueryBuilder('pf')
      .where('pf.estado = :ap', { ap: EstadoPerfil.APROBADO })
      .andWhere('pf.categoria = :cat', { cat: CategoriaTipo.ILUSTRADORES })
      .andWhere('pf.id != :yo', { yo: perfil.id })
      .andWhere('(pf.nombre_comercial ILIKE :t OR pf.instagram ILIKE :t)', { t: `%${texto}%` })
      .andWhere(
        `pf.id NOT IN (
          SELECT x.perfil_id FROM reserva_participantes x
          INNER JOIN reservas r ON r.id = x.reserva_id
          INNER JOIN stands s ON s.id = r.stand_id
          INNER JOIN pisos p ON p.id = s.piso_id
          WHERE p.evento_id = :ev AND r.estado IN ('PENDIENTE_PAGO','CONFIRMADA'))`,
        { ev: ev.id },
      )
      .orderBy('pf.nombre_comercial', 'ASC')
      .limit(10)
      .getMany();

    // Nunca se devuelve el celular
    return lista.map((p) => ({ id: p.id, nombreComercial: p.nombreComercial, instagram: p.instagram }));
  }

  // ───────────── reservar ─────────────

  async create(usuarioId: string, dto: CreateReservaDto) {
    try {
      await this.dataSource.transaction(async (m) => {
        const ahora = new Date();
        const perfil = await this.perfilAprobado(m, usuarioId);
        await this.liberarVencidas(m);

        // Bloquea la fila de la mesa: si dos personas la piden a la vez, la segunda espera
        const stand = await m
          .getRepository(Stand)
          .createQueryBuilder('s')
          .setLock('pessimistic_write')
          .where('s.id = :id', { id: dto.standId })
          .getOne();
        if (!stand) throw fallo(404, 'MESA_NO_EXISTE', 'La mesa no existe');

        if (stand.estado !== 'DISPONIBLE') {
          throw fallo(409, 'MESA_NO_DISPONIBLE', 'Esta mesa no está disponible');
        }

        const piso = await m
          .getRepository(Piso)
          .findOne({ where: { id: stand.pisoId }, relations: { evento: true } });
        const ev = piso?.evento;
        if (!ev || !EVENTOS_ABIERTOS.includes(ev.estado)) {
          throw fallo(404, 'EVENTO_NO_DISPONIBLE', 'El evento no está disponible');
        }

        if (!SELECCION_SIEMPRE_ABIERTA && (!ev.seleccionAbreEn || ev.seleccionAbreEn > ahora)) {
          throw fallo(403, 'SELECCION_CERRADA', 'La selección de mesas aún no está abierta');
        }

        if (stand.categoria !== perfil.categoria) {
          throw fallo(403, 'CATEGORIA_NO_PERMITIDA', 'Esta mesa es para otra categoría');
        }

        const ids = [perfil.id, ...(dto.companeroPerfilId ? [dto.companeroPerfilId] : [])].sort((a, b) => a - b);
        await m
          .getRepository(Perfil)
          .createQueryBuilder('pf')
          .setLock('pessimistic_write')
          .where('pf.id IN (:...ids)', { ids })
          .orderBy('pf.id', 'ASC')
          .getMany();

        const part = await this.participacion(m, perfil.id, ev.id);
        if (!part.reglasAceptadasEn || part.reglasVersion !== ev.reglasVersion) {
          throw fallo(403, 'REGLAS_NO_ACEPTADAS', 'Debes aceptar las reglas antes de reservar');
        }

        if (await this.reservaActivaDePerfil(m, perfil.id, ev.id)) {
          throw fallo(409, 'YA_TIENES_RESERVA', 'Ya tienes una mesa en esta edición');
        }

        const tomada = await m
          .getRepository(Reserva)
          .findOne({ where: { standId: stand.id, estado: In(ACTIVAS) } });
        if (tomada) throw fallo(409, 'MESA_TOMADA', 'Alguien acaba de reservar esta mesa');

        // Compañero (solo mesas de artistas)
        let companero: Perfil | null = null;
        if (dto.companeroPerfilId) {
          if (stand.categoria !== CategoriaTipo.ILUSTRADORES) {
            throw fallo(422, 'COMPANERO_NO_PERMITIDO', 'Solo las mesas de artistas admiten compañero');
          }
          if (dto.companeroPerfilId === perfil.id) {
            throw fallo(422, 'COMPANERO_INVALIDO', 'No puedes agregarte a ti mismo');
          }
          companero = await m.getRepository(Perfil).findOne({ where: { id: dto.companeroPerfilId } });
          if (
            !companero ||
            companero.estado !== EstadoPerfil.APROBADO ||
            companero.categoria !== CategoriaTipo.ILUSTRADORES
          ) {
            throw fallo(422, 'COMPANERO_INVALIDO', 'Ese perfil no está aprobado como artista');
          }
          if (await this.reservaActivaDePerfil(m, companero.id, ev.id)) {
            throw fallo(422, 'COMPANERO_INVALIDO', 'Ese perfil ya tiene mesa');
          }
        }

        const repo = m.getRepository(Reserva);
        const reserva = await repo.save(
          repo.create({
            participacionId: part.id,
            standId: stand.id,
            precioAcordado: Number(stand.precio),
            estado: EstadoReserva.PENDIENTE_PAGO,
            reservadoEn: ahora,
            venceEn: new Date(ahora.getTime() + ev.horasPago * 3600 * 1000),
          }),
        );
        reserva.codigo = `YF-${String(reserva.id).padStart(4, '0')}`;
        await repo.save(reserva);

        const rpRepo = m.getRepository(ReservaParticipante);
        await rpRepo.save(
          rpRepo.create({ reservaId: reserva.id, perfilId: perfil.id, tipo: TipoParticipante.TITULAR }),
        );
        if (companero) {
          await rpRepo.save(
            rpRepo.create({ reservaId: reserva.id, perfilId: companero.id, tipo: TipoParticipante.COMPANERO }),
          );
        }
      });
    } catch (e: any) {
      if (e?.code === '23505') {
        throw fallo(409, 'MESA_TOMADA', 'Alguien acaba de reservar esta mesa');
      }
      throw e;
    }
    return this.miReserva(usuarioId);
  }

  // ───────────── mi reserva ─────────────

  async miReserva(usuarioId: string) {
    const m = this.dataSource.manager;
    const perfil = await m.getRepository(Perfil).findOne({ where: { usuarioId } });
    if (!perfil) throw fallo(404, 'PERFIL_NO_ENCONTRADO', 'No se encontró tu perfil');
    await this.liberarVencidas(m);

    const r = await m
      .getRepository(Reserva)
      .createQueryBuilder('r')
      .innerJoinAndSelect('r.stand', 's')
      .leftJoinAndSelect('s.sector', 'sec')
      .innerJoinAndSelect('s.piso', 'p')
      .innerJoinAndSelect('p.evento', 'ev')
      .leftJoinAndSelect('r.participantes', 'rp')
      .leftJoinAndSelect('rp.perfil', 'pf')
      .where('r.id IN (SELECT x.reserva_id FROM reserva_participantes x WHERE x.perfil_id = :pid)', {
        pid: perfil.id,
      })
      .orderBy('r.reservadoEn', 'DESC')
      .getOne();
    if (!r) return null;

    const ahora = new Date();
    const titular = r.participantes.find((p) => p.tipo === TipoParticipante.TITULAR);
    const soyTitular = titular?.perfilId === perfil.id;
    const ev = r.stand.piso.evento;
    const sector = r.stand.sector?.nombre ?? 'General';
    const precio = Number(r.precioAcordado);

    let whatsappPagosUrl: string | null = null;
    if (soyTitular && ev.whatsappPagos && r.estado !== EstadoReserva.VENCIDA && r.estado !== EstadoReserva.CANCELADA) {
      const ig = (perfil.instagram || '').replace(/^@/, '');
      const texto =
        `Hola! Soy ${perfil.nombreComercial} (@${ig}). ` +
        `Reservé la mesa ${r.stand.codigo} (${sector}) para ${ev.nombre}. ` +
        `Código de reserva: ${r.codigo}. Monto: Bs ${precio}. ` +
        `Por favor, indícame cómo realizar el pago.`;
      whatsappPagosUrl = `${ev.whatsappPagos}?text=${encodeURIComponent(texto)}`;
    }

    return {
      id: r.id,
      codigo: r.codigo,
      estado: r.estado,
      precio,
      reservadoEn: r.reservadoEn,
      venceEn: r.venceEn,
      segundosRestantes:
        r.estado === EstadoReserva.PENDIENTE_PAGO
          ? Math.max(0, Math.floor((new Date(r.venceEn).getTime() - ahora.getTime()) / 1000))
          : 0,
      soyTitular,
      evento: { id: ev.id, nombre: ev.nombre },
      stand: { id: r.stand.id, codigo: r.stand.codigo, sector, categoria: r.stand.categoria },
      participantes: r.participantes.map((p) => ({
        perfilId: p.perfilId,
        tipo: p.tipo,
        nombreComercial: p.perfil?.nombreComercial,
        instagram: p.perfil?.instagram,
      })),
      whatsappPagosUrl,
      whatsappCanal: ev.whatsappCanal,
    };
  }

  // ───────────── admin: listar reservas ─────────────

  async listar(filtros: { estado?: string; q?: string }) {
    const m = this.dataSource.manager;
    await this.liberarVencidas(m);

    const qb = m
      .getRepository(Reserva)
      .createQueryBuilder('r')
      .innerJoinAndSelect('r.stand', 's')
      .leftJoinAndSelect('s.sector', 'sec')
      .leftJoinAndSelect('r.participantes', 'rp')
      .leftJoinAndSelect('rp.perfil', 'pf')
      .orderBy('r.reservadoEn', 'DESC');

    if (filtros.estado && Object.values(EstadoReserva).includes(filtros.estado as EstadoReserva)) {
      qb.andWhere('r.estado = :estado', { estado: filtros.estado });
    }

    const q = (filtros.q || '').trim().replace(/[%_\\]/g, '\\$&');
    if (q) {
      qb.andWhere(
        new Brackets((w) => {
          w.where('r.codigo ILIKE :q', { q: `%${q}%` })
            .orWhere('s.codigo ILIKE :q')
            .orWhere(
              `r.id IN (
                SELECT x.reserva_id FROM reserva_participantes x
                INNER JOIN perfiles f ON f.id = x.perfil_id
                WHERE f.nombre_comercial ILIKE :q OR f.instagram ILIKE :q OR f.celular ILIKE :q)`,
            );
        }),
      );
    }

    const lista = await qb.take(200).getMany();
    const ahora = Date.now();

    const persona = (p?: ReservaParticipante) =>
      p && {
        perfilId: p.perfilId,
        nombreComercial: p.perfil?.nombreComercial,
        instagram: p.perfil?.instagram,
        celular: p.perfil?.celular,
      };

    return lista.map((r) => ({
      id: r.id,
      codigo: r.codigo,
      estado: r.estado,
      precio: Number(r.precioAcordado),
      reservadoEn: r.reservadoEn,
      venceEn: r.venceEn,
      pagadoEn: r.pagadoEn,
      motivoLiberacion: r.motivoLiberacion,
      segundosRestantes:
        r.estado === EstadoReserva.PENDIENTE_PAGO
          ? Math.max(0, Math.floor((new Date(r.venceEn).getTime() - ahora) / 1000))
          : 0,
      stand: {
        id: r.stand.id,
        codigo: r.stand.codigo,
        sector: r.stand.sector?.nombre ?? 'General',
        categoria: r.stand.categoria,
      },
      titular: persona(r.participantes.find((p) => p.tipo === TipoParticipante.TITULAR)),
      companero: persona(r.participantes.find((p) => p.tipo === TipoParticipante.COMPANERO)),
    }));
  }

  // ───────────── admin: marcar pagada ─────────────

  async marcarPagada(id: number, adminId: string) {
    await this.dataSource.transaction(async (m) => {
      const r = await this.cargarReserva(m, id);
      if (r.estado === EstadoReserva.CONFIRMADA) {
        throw fallo(409, 'YA_PAGADA', 'Esta reserva ya está pagada');
      }
      if (r.estado === EstadoReserva.CANCELADA) {
        throw fallo(409, 'RESERVA_CANCELADA', 'La reserva fue cancelada; crea una nueva');
      }
      if (r.estado === EstadoReserva.VENCIDA) {
        await this.bloquearMesa(m, r.standId);
        if (!(await this.mesaLibre(m, r.standId))) {
          throw fallo(409, 'MESA_TOMADA', 'La reserva venció y otra persona ya tomó la mesa');
        }
      }
      await m.getRepository(Reserva).update(id, {
        estado: EstadoReserva.CONFIRMADA,
        pagadoEn: new Date(),
        pagadoPor: adminId,
        motivoLiberacion: () => 'NULL',
      });
    });
    return { ok: true };
  }

  // ───────────── admin: liberar ─────────────

  async liberar(id: number, motivo: string) {
    await this.dataSource.transaction(async (m) => {
      const r = await this.cargarReserva(m, id);
      if (!ACTIVAS.includes(r.estado)) {
        throw fallo(409, 'RESERVA_NO_ACTIVA', 'Solo se pueden liberar reservas activas');
      }
      await m.getRepository(Reserva).update(id, {
        estado: EstadoReserva.CANCELADA,
        motivoLiberacion: motivo.trim(),
      });
    });
    return { ok: true };
  }

  // ───────────── admin: extender plazo ─────────────

  async extenderPlazo(id: number, horas: number) {
    await this.dataSource.transaction(async (m) => {
      const r = await this.cargarReserva(m, id);
      if (r.estado === EstadoReserva.CONFIRMADA || r.estado === EstadoReserva.CANCELADA) {
        throw fallo(409, 'RESERVA_NO_EXTENDIBLE', 'Esta reserva ya no tiene plazo de pago');
      }
      if (r.estado === EstadoReserva.VENCIDA) {
        await this.bloquearMesa(m, r.standId);
        if (!(await this.mesaLibre(m, r.standId))) {
          throw fallo(409, 'MESA_TOMADA', 'La reserva venció y otra persona ya tomó la mesa');
        }
      }
      const base = Math.max(new Date(r.venceEn).getTime(), Date.now());
      await m.getRepository(Reserva).update(id, {
        estado: EstadoReserva.PENDIENTE_PAGO,
        venceEn: new Date(base + horas * 3600 * 1000),
        motivoLiberacion: () => 'NULL',
      });
    });
    return { ok: true };
  }

  // ───────────── admin: reserva manual ─────────────

  async crearManual(dto: CreateReservaManualDto, adminId: string) {
    let reservaId = 0;
    try {
      await this.dataSource.transaction(async (m) => {
        const ahora = new Date();
        await this.liberarVencidas(m);

        const stand = await this.bloquearMesa(m, dto.standId);
        if (!stand) throw fallo(404, 'MESA_NO_EXISTE', 'La mesa no existe');

        const piso = await m
          .getRepository(Piso)
          .findOne({ where: { id: stand.pisoId }, relations: { evento: true } });
        const ev = piso?.evento;
        if (!ev) throw fallo(404, 'EVENTO_NO_DISPONIBLE', 'El evento no está disponible');

        const perfil = await m.getRepository(Perfil).findOne({ where: { id: dto.titularPerfilId } });
        if (!perfil || perfil.estado !== EstadoPerfil.APROBADO) {
          throw fallo(422, 'PERFIL_NO_APROBADO', 'El perfil no está aprobado');
        }
        if (stand.categoria !== perfil.categoria) {
          throw fallo(403, 'CATEGORIA_NO_PERMITIDA', 'Esta mesa es para otra categoría');
        }
        if (await this.reservaActivaDePerfil(m, perfil.id, ev.id)) {
          throw fallo(409, 'YA_TIENES_RESERVA', 'Ese perfil ya tiene mesa en esta edición');
        }
        if (!(await this.mesaLibre(m, stand.id))) {
          throw fallo(409, 'MESA_TOMADA', 'La mesa ya está reservada');
        }
        const companero = await this.validarCompanero(m, stand, perfil, ev.id, dto.companeroPerfilId);

        const part = await this.participacion(m, perfil.id, ev.id);
        const pagada = !!dto.pagada;
        const repo = m.getRepository(Reserva);
        const reserva = await repo.save(
          repo.create({
            participacionId: part.id,
            standId: stand.id,
            precioAcordado: Number(stand.precio),
            estado: pagada ? EstadoReserva.CONFIRMADA : EstadoReserva.PENDIENTE_PAGO,
            reservadoEn: ahora,
            venceEn: new Date(ahora.getTime() + ev.horasPago * 3600 * 1000),
            ...(pagada ? { pagadoEn: ahora, pagadoPor: adminId } : {}),
          }),
        );
        reserva.codigo = `YF-${String(reserva.id).padStart(4, '0')}`;
        await repo.save(reserva);

        const rp = m.getRepository(ReservaParticipante);
        await rp.save(rp.create({ reservaId: reserva.id, perfilId: perfil.id, tipo: TipoParticipante.TITULAR }));
        if (companero) {
          await rp.save(rp.create({ reservaId: reserva.id, perfilId: companero.id, tipo: TipoParticipante.COMPANERO }));
        }
        reservaId = reserva.id;
      });
    } catch (e: any) {
      if (e?.code === '23505') throw fallo(409, 'MESA_TOMADA', 'La mesa ya está reservada');
      throw e;
    }
    return { ok: true, id: reservaId };
  }
}