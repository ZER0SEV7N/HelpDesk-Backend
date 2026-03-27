//importar todas las entidades para que TypeORM las reconozca
import { Usuario } from './entities/Usuario.entity';
import { Rol } from './entities/Rol.entity';
import { Equipos } from './entities/Equipos.entity';
import { Software } from './entities/Software.entity';
import { Planes } from './entities/Planes.entity';
import { Tickets } from './entities/Tickets.entity';
import { Clientes } from './entities/Clientes.entity';
import { Sucursales } from './entities/Sucursales.entity';
import { Hardware } from './entities/Hardware.entity';
import { RegistroHardware } from './entities/RegistroHardware.entity';
import { Software_equipos } from './entities/SoftwareEquipos.entity';
import { Area } from './entities/Area.entity';

export const AllEntities = [
    Usuario,
    Rol,
    Equipos,
    Software,
    Planes,
    Tickets,
    Clientes,
    Sucursales,
    Hardware,
    RegistroHardware,
    Software_equipos,
    Area
];
