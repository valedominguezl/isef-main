import React from 'react';
import ScrollToSection from '@/components/funciones/scroll/ScrollToSection.jsx';
import LoadingAnchor from '@/components/funciones/loadingBar/LoadingAnchor';

const faqData = [
    // Duración
    {
        question: '¿Qué duración tiene la carrera?',
        answer: <>La carrera tiene una <strong>duración estimada de 4 años</strong> expresados en: <strong>2.976 horas reloj</strong> o <strong>4.446 horas cátedra</strong>.</>
    },

    // Requisitos
    {
        question: '¿Qué requisitos se necesitan para inscribirse?',
        answer: <>
            Vas a tener que llenar la <strong>ficha de inscripción</strong> y la <strong>planilla de exámenes médicos</strong> que podés descargar en la sección{' '}
            <LoadingAnchor href="/Inscripciones" target="_blank">
                inscripciones
            </LoadingAnchor>.
            Además, deberás <strong>abonar la inscripción</strong>
        </>
    },

    // Ubicación
    {
        question: '¿Dónde se encuentra el I.S.E.F. San Luís?',
        answer: <>
            Estamos en: <br /> <br />
            <strong>Ciudad de San Luís</strong>: Colón 1138, Club Sociedad Española. <br /> <br />
            <strong>Villa Mercedes</strong>: Pedernera 635 Fundación Eva Perón <br /> <br />
            Podés ver <strong>más información</strong> sobre las sedes{' '}
            <ScrollToSection id="homeSedes">acá</ScrollToSection>.
        </>
    },

    // Modalidad virtual
    {
        question: '¿Se puede cursar virtual?',
        answer: <>
            No, la carrera es <strong>únicamente presencial</strong> {' '}
            <ScrollToSection id="homeSedes">
                (ver sedes)
            </ScrollToSection>
            , aunque muchas de las{' '}
            <LoadingAnchor href="/Especializaciones" target="_blank">
                <strong>especializaciones</strong>
            </LoadingAnchor> que ofrecemos a nuestros alumnos son virtuales.
        </>
    },

    // Cuota
    // {
    //     question: '¿Qué valor tiene la cuota? ¿Hay gastos adicionales?',
    //     answer: <>
    //         La <strong>cuota actualizada</strong> podés verla{' '}
    //         <LoadingAnchor href="/Aranceles" target="_blank">
    //             <strong>acá</strong>
    //         </LoadingAnchor>
    //         . En el I.S.E.F. San Luís no te cobramos gastos adicionales, sean constancias, certificaciones, cuotas aguinaldo, matricula o pileta de natación. <br /> <br />
    //         Por otro lado, <strong>el uniforme sí se paga a parte</strong> y es obligatorio. Te recomendamos comprarlo en {' '}
    //         <LoadingAnchor href="https://wa.me/+5492664554121" target="_blank">
    //             <strong>UNIFOR Indumentaria</strong>.
    //         </LoadingAnchor>
    //     </>
    // },

    // Horarios
    {
        question: '¿En qué horarios se cursa?',
        answer: <>
            Tanto en San Luís como Villa Mercedes, se cursa de <strong>07:30hs a 13:30hs, de Lunes a Viernes. </strong> Mirá más información sobre la carrera{' '}
            <LoadingAnchor href="/Carrera" target="_blank">
                <strong>acá</strong>
            </LoadingAnchor>.
        </>
    },

    // Secundario
    {
        question: '¿Qué pasa si todavía adeudo materias del secundario?',
        answer: <>
            Vas a tener hasta el <strong>30 de Julio para sacar todas las materias</strong>, si después de esta fecha no las pudiste aprobar, no vas a poder seguir cursando en el profesorado.
        </>
    },

    // Límite
    {
        question: '¿Hasta cuándo tengo tiempo de presentar los requisitos de inscripción?',
        answer: <>
            Vas a tener <strong>hasta el 30 de marzo</strong> para presentar los requisitos, si después de esta fecha no los presentaste en secretaría, <strong>no vas a poder seguir cursando</strong> en el profesorado.
        </>
    },

    // Primera cuota
    {
        question: '¿Cuándo se paga la primera cuota?',
        answer: <>
            La primera de las 48 cuotas <strong>se empieza a pagar en marzo</strong>.
        </>
    },
];

export { faqData };
