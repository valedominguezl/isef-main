import { useRef, useState } from 'react';
import { ImageUp, Trash2 } from 'lucide-react';
import type { Certificado } from '@/content/schema';
import { useAdmin } from '../AdminContext';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toaster';
import { useFirma } from './firma';
import Vista from './Vista';
import adm from '../Admin.module.scss';
import s from './Certificados.module.scss';

/** Pestaña «Datos del certificado»: vista previa en vivo + firma escaneada del rector (para todos los certificados). */
export default function VistaDatos({ cert }: { cert: Certificado }) {
  const { api } = useAdmin();
  const toast = useToast();
  const { firma, version, error, guardar } = useFirma(api);
  const [ocupado, setOcupado] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const cambiar = async (archivo: File | null) => {
    setOcupado(true);
    try {
      await guardar(archivo);
      toast.show({ text: archivo ? 'Firma guardada. Ya sale en todos los certificados.' : 'Se quitó la firma.' });
    } catch (e) {
      toast.show({ text: `No se pudo guardar la firma: ${(e as Error).message}` });
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className={s.datos}>
      <Vista cert={cert} firma={firma} firmaVersion={version} etiqueta="Vista previa del certificado con una persona de muestra" />
      <div className={s.firma}>
        <p className={adm.label}>Firma escaneada</p>
        <p className={adm.help}>
          {firma === undefined
            ? 'Cargando…'
            : firma
              ? 'Se usa en todos los certificados. Se guarda en la cuenta de Google del instituto, no en el sitio.'
              : (error ?? 'Subí una foto o escaneo de la firma: se le saca el fondo sola.')}
        </p>
        <div className={s.firmaAcciones}>
          <Button variant="secondary" icon={ImageUp} spin={ocupado} disabled={ocupado} onClick={() => input.current?.click()}>
            {firma ? 'Cambiar firma' : 'Subir firma'}
          </Button>
          {firma && (
            <Button variant="ghost" icon={Trash2} disabled={ocupado} onClick={() => void cambiar(null)}>
              Quitar
            </Button>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (f) void cambiar(f);
          }}
        />
      </div>
    </div>
  );
}
