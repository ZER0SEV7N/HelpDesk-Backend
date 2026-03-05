// src/all-entities.ts

// 1. Importa todas tus entidades aquí (ajusta las rutas según tus carpetas)
import { Empresa } from './entities/empresa.entity';
import { Sucursales } from './entities/Sucursales.entity';
import { MicroEmpresa } from './entities/MicroEmpresa.entity';
import { PersonaNatural } from './entities/persona_natural.entity';
import { Cliente_G } from './entities/cliente_g.entity';
import { Area } from './entities/Area.entity';
import { Contactos_Ref } from './entities/contactos_Ref.entity';
import { Equipos } from './entities/equipos.entity';
import { Hardware } from './entities/hardware.entity';
import { Software } from './entities/software.entity';
import { Software_equipos } from './entities/software_equipos.entity';
import { RegistroHardware } from './entities/RegistroHardware.entity';
import { Ticket } from './entities/tickets.entity';
import { Planes } from './entities/planes.entity';
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