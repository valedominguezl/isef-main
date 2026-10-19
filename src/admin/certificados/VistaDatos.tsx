import { useRef, useState } from 'react';
import { ImageUp, Trash2 } from 'lucide-react';
import type { Certificado } from '@/content/schema';
import { useAdmin } from '../AdminContext';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toaster';
import { useConfirm } from '../ui/ConfirmDialog';
import { useImagenCert, type Cual } from './firma';
import Vista from './Vista';
import adm from '../Admin.module.scss';
import s from './Certificados.module.scss';

const TEXTOS: Record<Cual, { titulo: string; la: string; Mayus: string; vacia: string }> = {
  firma: { titulo: 'Firma escaneada', la: 'la firma', Mayus: 'Firma', vacia: 'Subí una foto o escaneo de la firma: se le saca el fondo sola.' },
  sello: { titulo: 'Sello del instituto', la: 'el sello', Mayus: 'Sello', vacia: 'Subí una foto o escaneo del sello: se le saca el fondo solo y sale al lado de la firma.' },
};

/** Subir, cambiar o quitar la firma o el sello (valen para todos los certificados). */
function ImagenCert({ cual, imagen, error, guardar }: { cual: Cual; imagen: ArrayBuffer | null | undefined; error: string | null; guardar: (f: File | null) => Promise<void> }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [ocupado, setOcupado] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const t = TEXTOS[cual];

  const cambiar = async (archivo: File | null) => {
    setOcupado(true);
    try {
      await guardar(archivo);
      toast.show({ text: archivo ? `${t.Mayus} guardad${cual === 'firma' ? 'a' : 'o'}. Ya sale en todos los certificados.` : `Se quitó ${t.la}.` });
    } catch (e) {
      toast.show({ text: `No se pudo guardar ${t.la}: ${(e as Error).message}` });
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className={s.firma}>
      <p className={adm.label}>{t.titulo}</p>
      <p className={adm.help}>
        {imagen === undefined ? 'Cargando…' : imagen ? 'Se usa en todos los certificados. Se guarda en la cuenta de Google del instituto, no en el sitio.' : (error ?? t.vacia)}
      </p>
      <div className={s.firmaAcciones}>
        <Button variant="secondary" icon={ImageUp} spin={ocupado} disabled={ocupado} onClick={() => input.current?.click()}>
          {imagen ? `Cambiar ${cual}` : `Subir ${cual}`}
        </Button>
        {imagen && (
          <Button
            variant="ghost"
            icon={Trash2}
            disabled={ocupado}
            onClick={async () => {
              // Afecta a todos los certificados: se pregunta antes
              const ok = await confirm({
                title: `¿Quitar ${t.la}?`,
                body: `Los certificados salen sin ${cual} hasta que subas ${cual === 'firma' ? 'otra' : 'otro'}.`,
                confirmLabel: 'Quitar',
              });
              if (ok) void cambiar(null);
            }}
          >
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
  );
}

/** Pestaña «Datos del certificado»: vista previa en vivo + firma del rector y sello (para todos los certificados). */
export default function VistaDatos({ cert }: { cert: Certificado }) {
  const { api } = useAdmin();
  const firma = useImagenCert(api, 'firma');
  const sello = useImagenCert(api, 'sello');
  return (
    <div className={s.datos}>
      <Vista
        cert={cert}
        firma={firma.imagen}
        firmaVersion={firma.version}
        sello={sello.imagen}
        selloVersion={sello.version}
        etiqueta="Vista previa del certificado con una persona de muestra"
      />
      <div className={s.imagenes}>
        <ImagenCert cual="firma" imagen={firma.imagen} error={firma.error} guardar={firma.guardar} />
        <ImagenCert cual="sello" imagen={sello.imagen} error={sello.error} guardar={sello.guardar} />
      </div>
    </div>
  );
}
