import { CsvProcessorUtil } from './csv-processor.util';

describe('CsvProcessorUtil', () => {
  const util = new CsvProcessorUtil();

  it('debería parsear CSV correctamente', async () => {
    const csv = `nombre,correo,telefono
Juan,juan@example.com,123456789
Maria,maria@example.com,987654321`;
    const buffer = Buffer.from(csv, 'utf-8');
    const result = await util.parseCsv(buffer, ['nombre', 'correo', 'telefono']);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      nombre: 'Juan',
      correo: 'juan@example.com',
      telefono: '123456789',
    });
  });

  it('debería fallar si faltan columnas requeridas', async () => {
    const csv = `nombre,correo
Juan,juan@example.com`;
    const buffer = Buffer.from(csv, 'utf-8');
    await expect(
      util.parseCsv(buffer, ['nombre', 'correo', 'telefono']),
    ).rejects.toThrow();
  });

  it('debería parsear CSV vacío', async () => {
    const csv = `nombre,correo,telefono`;
    const buffer = Buffer.from(csv, 'utf-8');
    const result = await util.parseCsv(buffer, ['nombre', 'correo', 'telefono']);
    expect(result).toHaveLength(0);
  });
});
