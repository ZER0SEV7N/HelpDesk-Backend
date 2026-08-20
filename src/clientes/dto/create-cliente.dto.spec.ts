import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { TipoCliente } from '@/entities/Clientes.entity';

describe('CreateClienteDto', () => {
  const CreateClienteDto = require('./create-cliente.dto').CreateClienteDto;

  it('debería ser válido con datos correctos', async () => {
    const dto = plainToClass(CreateClienteDto, {
      tipo_cliente: TipoCliente.Juridica,
      numero_documento: '123456789',
      nombre_principal: 'Empresa Test',
      direccion: 'Calle 1',
      telefono: '123456789',
      correo: 'test@example.com',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debería fallar si numero_documento está vacío', async () => {
    const dto = plainToClass(CreateClienteDto, {
      tipo_cliente: TipoCliente.Juridica,
      numero_documento: '',
      nombre_principal: 'Empresa Test',
      direccion: 'Calle 1',
      telefono: '123456789',
      correo: 'test@example.com',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'numero_documento')).toBe(true);
  });

  it('debería fallar si correo no es válido', async () => {
    const dto = plainToClass(CreateClienteDto, {
      tipo_cliente: TipoCliente.Juridica,
      numero_documento: '123456789',
      nombre_principal: 'Empresa Test',
      direccion: 'Calle 1',
      telefono: '123456789',
      correo: 'invalido',
    });
    const errors = await validate(dto);
    expect(errors.some(e => e.property === 'correo')).toBe(true);
  });
});
