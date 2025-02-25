import React from "react";
import styles from './Tabla.module.scss'
import LoadingAnchor from "@/components/funciones/loadingBar/LoadingAnchor";

const Tabla = () => {
  return (
    <div className={styles.container}>
      <table>
        <caption><h2>Tabla de <span>valores</span></h2></caption>

        <thead>
          <tr>
            <th>Concepto</th>
            <th>Carácter</th>
            <th>Cuotas</th>
            <th>Precio normal</th>
            <th>
              <div>
                Precio c/ descuento
                <small>(antes del 10 de cada mes)</small>
              </div>
            </th>
          </tr>
        </thead>

        <tbody className={styles.tabla}>
          <tr>
            <td>Inscripción</td>
            <td>Pago único</td>
            <td>—</td>
            <td><strong>$50.000</strong></td>
            <td>—</td>
          </tr>
          <tr>
            <td>
              <div>
                Título
                <small>(Luego de las 48 cuotas)</small>
              </div>
            </td>
            <td>Pago único</td>
            <td>—</td>
            <td><strong>$50.000</strong></td>
            <td>—</td>
          </tr>
        </tbody>

        <tbody className={styles.cuotas}>
          <tr>
            <td>Cuota general</td>
            <td>Mensual</td>
            <td>48</td>
            <td>$55.000</td>
            <td><strong>$50.000</strong></td>
          </tr>
          <tr>
            <td>Cuota hermano</td>
            <td>Mensual</td>
            <td>48</td>
            <td>$55.000</td>
            <td><strong>$47.000</strong></td>
          </tr>
          <tr>
            <td>Cuota policial</td>
            <td>Mensual</td>
            <td>48</td>
            <td>$55.000</td>
            <td><strong>$47.000</strong></td>
          </tr>
          <tr>
            <td>
              <div>
                Cuota residencia
                <small>(recursantes)</small>
              </div>
            </td>
            <td>Mensual</td>
            <td>12</td>
            <td>$55.000</td>
            <td><strong>$38.000</strong></td>
          </tr>
          <tr>
            <td>
              <div>Cuota por materia
                <small>(por materia a recursar)</small>
              </div>
            </td>
            <td>Mensual</td>
            <td>12</td>
            <td>$35.000</td>
            <td><strong>$28.000</strong></td>
          </tr>
        </tbody>

        <tbody className={styles.uniforme}>
          <tr>
            <td>Uniforme</td>
            <td>
              <strong>Obligatorio</strong></td>
            <td>—</td>
            <td>
              <div>Consultar en
                <LoadingAnchor
                  href="https://wa.me/+5492664554121"
                  target="_blank">
                  <strong>UNIFOR Indumentaria</strong>
                </LoadingAnchor>
              </div>
            </td>
            <td>—</td>
          </tr>
        </tbody>

        <tbody className={styles.gratis}>
          <tr>
            <td>Matrícula anual</td>
            <td><strong>Gratis</strong></td>
            <td>—</td>
            <td>—</td>
            <td>—</td>
          </tr>
          <tr>
            <td>Permisos de
              examen</td>
            <td><strong>Gratis</strong></td>
            <td>—</td>
            <td>—</td>
            <td>—</td>
          </tr>
          <tr>
            <td>Pileta de natación</td>
            <td><strong>Gratis</strong></td>
            <td>—</td>
            <td>—</td>
            <td>—</td>
          </tr>
          <tr>
            <td>Especializaciones</td>
            <td><strong>Gratis</strong></td>
            <td>—</td>
            <td>—</td>
            <td>—</td>
          </tr>
          <tr>
            <td>Certificaciones</td>
            <td><strong>Gratis</strong></td>
            <td>—</td>
            <td>—</td>
            <td>—</td>
          </tr>
          <tr>
            <td>Cuota aguinaldo</td>
            <td><strong>Gratis</strong></td>
            <td>—</td>
            <td>—</td>
            <td>—</td>
          </tr>
        </tbody>

      </table>
    </div >
  );
};

export default Tabla;
