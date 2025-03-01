import videoData from './videos';
import styles from "./Hijos.module.scss";
import searchIcon from '@/assets/simbols/search.webp';
import { useState, useEffect } from 'react';

export default function Hijos() {
    const [searchText, setSearchText] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const normalizeText = (text) => {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    // Filtrar los videos basados en la búsqueda
    const filteredVideos = videoData.filter((video) => {
        const search = normalizeText(debouncedSearch.trim()).toLowerCase();
        const titleMatches = normalizeText(video.title).toLowerCase().includes(search);
        const linksText = video.links.map(link => normalizeText(link.name).toLowerCase()).join(' ');
        const linksMatches = linksText.includes(search);
        return titleMatches || linksMatches;
    });

    // Aplicar debounce para la búsqueda
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchText);
        }, 300);
        return () => {
            clearTimeout(handler);
        };
    }, [searchText]);

    return (
        <div className={styles.container}>
            {/* Contenedor de búsqueda */}
            <div className={styles.searchCont}>
                <div className={styles.img}>
                    <img src={searchIcon} alt="search icon" />
                </div>
                <input
                    type="text"
                    id="searchInput"
                    className={styles.txt}
                    placeholder={'Buscar conferencias...'}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>

            {/* Contenedor general de las conferencias */}
            <div className={styles.conferences}>
                {/* Mapear los videos filtrados */}
                {filteredVideos.length > 0 ? (
                    filteredVideos.map((conference) => (
                        <div key={conference.id || conference.title} className={styles.titulo}> {/* Asignamos una key única */}
                            <h3 className={styles.title}>{conference.title}</h3>
                            <div className="linea-svg"></div>
                            {conference.links.map((video) => (
                                <p key={video.id || video.name} className={styles.link}> {/* Asignamos key única también a los enlaces */}
                                    <a href={video.url} target="_blank" rel="noopener noreferrer">
                                        {video.name}
                                    </a>
                                </p>
                            ))}
                        </div>
                    ))
                ) : (
                    <p>No se encontraron grabaciones.</p>  // Mensaje si no hay resultados
                )}
            </div>
        </div>
    );
}
