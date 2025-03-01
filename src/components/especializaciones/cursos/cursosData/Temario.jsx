import React, { useState, useRef, useEffect } from "react";
import styles from "./Temario.module.scss";
import { motion, AnimatePresence } from "framer-motion";

const TopicItem = ({ topic, numbering }) => {
    const [expanded, setExpanded] = useState(false);
    const subTopicsRef = useRef(null);
    const numberingText = numbering.join(".");

    const hasSubtemas = topic.subtemas && topic.subtemas.length > 0;

    const formatTextWithLineBreaks = (text) => {
        return text.split(/(\. )(?!$)/).map((part, index) => (
            <React.Fragment key={index}>
                {part}
                {part === ". " && <br />}
            </React.Fragment>
        ));
    };

    useEffect(() => {
        if (expanded && subTopicsRef.current) {
            subTopicsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [expanded]);

    return (
        <div className={styles.topic}>
            {hasSubtemas ? (
                <div
                    onClick={() => setExpanded(!expanded)}
                    className={`${styles.toggle} ${expanded ? styles.active : ''}`}
                >
                    <span className={`${styles.activador} ${expanded ? styles.active : ''}`}></span>
                    <span className={styles.numbering}>{numberingText}</span>
                    <strong> {topic.tema} </strong>
                </div>
            ) : (
                <div className={styles.subTopic}>
                    <span className={styles.numbering}>{numberingText}</span>
                    <p className={styles.subTema}>
                        {formatTextWithLineBreaks(topic.tema)}
                    </p>
                </div>
            )}
            {hasSubtemas && (
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            ref={subTopicsRef}
                            className={styles.subTopics}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                            {topic.subtemas.map((sub, index) => (
                                <div key={index} className={styles.subTopic}>
                                    <span className={styles.numbering}>{`${numberingText}.${index + 1}`}</span>
                                    <p className={styles.subTema}>
                                        {formatTextWithLineBreaks(sub.tema)}
                                    </p>
                                </div>
                            ))}

                            <span className={`${styles.activador2} ${expanded ? styles.active : ''}`}></span>

                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
};

const Temario = ({ temario }) => {
    return (
        <div className={styles.temario}>
            {temario.map((topic, index) => (
                <TopicItem key={index} topic={topic} numbering={[index + 1]} />
            ))}
        </div>
    );
};

export default Temario;
