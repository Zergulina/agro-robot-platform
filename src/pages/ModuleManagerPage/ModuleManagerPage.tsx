import React, { useEffect, useState } from 'react';
import classes from './ModuleManagerPage.module.css'
import pageClasses from '../Page.module.css'
import SecondaryButton from '../../ui/buttons/SecondaryButton/SecondaryButton';
import { Window } from '@tauri-apps/api/window';
import { Module } from '../../types/api/module';
import { getAllModules } from '../../api/module/getAllModules';
import ModuleCard from '../../modules/ModuleCard/ModuleCard';
import { deleteModuleById } from '../../api/module/deleteModuleById';

const SketchManagerPage: React.FC = () => {
    const [cards, setCards] = useState<Module[]>([]);

    useEffect(() => {
        getAllModules(setCards);
    }, []);

    return (
        <div className={pageClasses.Page}>

            <div className={classes.ModuleManager}>
                {
                    cards.map((card) => <ModuleCard module={card} deleteCallback={() => deleteModuleById(card.id, () => setCards([...cards].filter(c => card.id != c.id)))}/>)
                }
            </div>
            <div className={classes.BottomPanel}>
                <SecondaryButton onClick={() => Window.getCurrent().close()}>Закрыть</SecondaryButton>
            </div>
        </div>
    );
};

export default SketchManagerPage;