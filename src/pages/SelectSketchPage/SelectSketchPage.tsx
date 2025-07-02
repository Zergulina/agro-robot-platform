import React, { useEffect, useState } from 'react';
import { MicroControllerSketch, SketchFullInfo } from '../../types/api/sketch';
import { getAllSketchesFullInfo } from '../../api/sketch/getAllSketchesFullInfo';
import pageClasses from '../Page.module.css'
import classes from './SelectSketchPage.module.css'
import SketchCard from '../../modules/SketchCard/SketchCard';
import { getMicroControllerSketchById } from '../../api/sketch/getMicroControllerSketchById';
import { emit } from '@tauri-apps/api/event';
import { Window } from '@tauri-apps/api/window';

const SelectSketchPage: React.FC = () => {
    const [cards, setCards] = useState<SketchFullInfo[]>([]);

    useEffect(() => {
        getAllSketchesFullInfo(setCards);
    }, []);


    return (
        <div className={pageClasses.Page}>
            
            <div className={classes.SketchManager}>
                {
                    cards.map((card) => <SketchCard sketch={card} selectItemCallback={() => {
                        getMicroControllerSketchById(card.id, (value: MicroControllerSketch) => {
                            emit("mc-sketch-update", value);
                            Window.getCurrent().close();
                        });
                    }
                    } />)
                }
            </div>
        </div>
    );
};

export default SelectSketchPage;