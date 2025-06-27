import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MicroControllerSketch, SketchFullInfo } from '../../types/api/sketch';
import { getAllSketchesFullInfo } from '../../api/sketch/getAllSketchesFullInfo';
import pageClasses from '../Page.module.css'
import classes from './SelectSketchPage.module.css'
import SketchCard from '../../modules/SketchCard/SketchCard';
import { useMicroController } from '../../storage/SelectedMicroControllerProvider';
import { getMicroControllerSketchById } from '../../api/sketch/getMicroControllerSketchById';
import { getCurrentWindow, Window } from '@tauri-apps/api/window';

const SelectSketchPage: React.FC = () => {
    const [cards, setCards] = useState<SketchFullInfo[]>([]);
    const {microController} = useMicroController();

    useEffect(() => {
        getAllSketchesFullInfo(setCards);
    }, []);

    return (
        <div className={pageClasses.Page}>
            <div className={classes.SearchPanel}>

            </div>
            <div className={classes.SketchManager}>
                {
                    cards.map((card) => <SketchCard sketch={card} selectItemCallback={() => {
                        getMicroControllerSketchById(card.id, (value: MicroControllerSketch) => microController?.setSketch(value));
                        Window.getCurrent().close();
                    }
                    }/>)
                }
            </div>
        </div>
    );
};

export default SelectSketchPage;