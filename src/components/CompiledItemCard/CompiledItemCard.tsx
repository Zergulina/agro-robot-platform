import React, { useState } from 'react';
import classes from './CompiledItem.module.css'
import AccentButton from '../../ui/buttons/AccentButton/AccentButton';
import SecondaryButton from '../../ui/buttons/SecondaryButton/SecondaryButton';

type CompiledItemCardProps = {
    name: string,
    description: string,
    deleteCallback?: () => void,
    selectItemCallback?: () => void,
    children: React.ReactNode
}

const CompiledItemCard: React.FC<CompiledItemCardProps> = ({ name, description, deleteCallback, selectItemCallback, children }) => {
    const [showMoreFlag, setShowMoreFlag] = useState<boolean>(false);

    return (
        <div className={classes.CompiledItemCard}>
            <h3>{name}</h3>
            <p>{description}</p>
            <div className={classes.ButtonPanel}>
                <AccentButton onClick={() => setShowMoreFlag(!showMoreFlag)}>{showMoreFlag ? "Скрыть подробности" : "Подробная информация"}</AccentButton>
                {deleteCallback && <SecondaryButton onClick={() => deleteCallback()}>Удалить</SecondaryButton>}
                {selectItemCallback && <AccentButton onClick={() => selectItemCallback()}>Выбрать</AccentButton>}
            </div>
            <div>
                {
                    showMoreFlag && children
                }
            </div>
        </div>
    );
};

export default CompiledItemCard;