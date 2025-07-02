import React, { useEffect, useState } from 'react';
import classes from './SketchManagerPage.module.css'
import pageClasses from '../Page.module.css'
import SecondaryButton from '../../ui/buttons/SecondaryButton/SecondaryButton';
import { Window } from '@tauri-apps/api/window';
import { CreateSketchRequest, SketchFullInfo } from '../../types/api/sketch';
import SketchCard from '../../modules/SketchCard/SketchCard';
import AccentButton from '../../ui/buttons/AccentButton/AccentButton';
import { invoke } from '@tauri-apps/api/core';
import { parseSketch } from '../../logic/parseSketch';
import { useNewSketch } from '../../storage/NewSketchContextProvider';
import { useNavigate } from 'react-router-dom';
import { getAllSketchesFullInfo } from '../../api/sketch/getAllSketchesFullInfo';
import { deleteSketchById } from '../../api/sketch/deleteSketchById';

const SketchManagerPage: React.FC = () => {
    const {setNewSketch} = useNewSketch();
    const navigate = useNavigate();
    const [cards, setCards] = useState<SketchFullInfo[]>([]);

    useEffect(() => {
        getAllSketchesFullInfo(setCards);
    }, []);

    return (
        <div className={pageClasses.Page}>
            <div className={classes.SketchManager}>
                {
                    cards.map((card) => <SketchCard sketch={card} deleteCallback={() => deleteSketchById(card.id, () => setCards([...cards].filter(c => card.id != c.id)))}/>)
                }
            </div>
            <div className={classes.BottomPanel}>
                <AccentButton onClick={() => {
                    invoke<{code: string, file_name: string}>("get_sketch_code_from_new_file").then(result => {
                        const fullSketchInfo = parseSketch(result.code);
                        const newSketch: CreateSketchRequest = {
                            name: result.file_name.substring(0, result.file_name.length - 4),
                            file_name: result.file_name,
                            description: "",
                            code: result.code,
                            params: fullSketchInfo.params,
                            procedures: fullSketchInfo.procedures,
                            datas: fullSketchInfo.datas
                        };
                        fullSketchInfo.file_name = result.file_name;
                        setNewSketch(newSketch);
                        navigate("add");
                    }).catch((e) => console.error(e))
                }}>
                    Добавить
                </AccentButton>
                <SecondaryButton onClick={() => Window.getCurrent().close()}>Закрыть</SecondaryButton>
            </div>
        </div>
    );
};

export default SketchManagerPage;