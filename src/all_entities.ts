// src/all-entities.ts

// 1. Importa todas tus entidades aquí (ajusta las rutas según tus carpetas)
import { Empresa } from './entities/Empresa.entity';
import { Sucursales } from './entities/Sucursales.entity';
import { MicroEmpresa } from './entities/MicroEmpresa.entity';
import { PersonaNatural } from './entities/Persona_natural.entity';
import { Cliente_G } from './entities/Cliente_g.entity';
import { Area } from './entities/Area.entity';
import { Contactos_Ref } from './entities/Contactos_Ref.entity';
import { Equipos } from './entities/Equipos.entity';
import { Hardware } from './entities/hardware.entity';
import { Software } from './entities/Software.entity';
import { Software_equipos } from './entities/Software_equipos.entity';
import { RegistroHardware } from './entities/RegistroHardware.entity';
import { Ticket } from './entities/Tickets.entity';
import { Planes } from './entities/Planes.entity';
import { EquiposTickets } from './entities/Equipos-tickets.entity';
import { RegistroDeCuentas } from './entities/RegistroDeCuentas.entity';
import { Cuenta_trabajadores } from './entities/Cuenta_trabajadores.entity';
import { Usuario } from './entities/Usuario.entity';
import { Rol } from './entities/Rol.entity';

// 2. Exporta un arreglo con TODAS ellas
export const ENTITIES_ARRAY = [
  Empresa,
  Sucursales,
  MicroEmpresa,
  PersonaNatural,
  Cliente_G,
  Area,
  Contactos_Ref,
  Equipos,
  Hardware,
  Software,
  Software_equipos,
  RegistroHardware,
  Ticket,
  Planes,
  EquiposTickets,
  RegistroDeCuentas,
  Cuenta_trabajadores,
];