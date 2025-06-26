import React from 'react';
import pageClasses from '../Page.module.css'
import classes from './AddSketchPage.module.css';
import { useNewSketch } from '../../storage/NewSketchContextProvider';
import SecondaryButton from '../../ui/buttons/SecondaryButton/SecondaryButton';
import AccentButton from '../../ui/buttons/AccentButton/AccentButton';
import { useNavigate } from 'react-router-dom';
import { createSketch } from '../../api/sketch/createSketch';

const AddSketchPage: React.FC = () => {
    const { newSketch, setNewSketch } = useNewSketch();
    const navigate = useNavigate();

    return (
        <div className={pageClasses.Page}>
            {
                newSketch &&
                <div className={classes.AddSketchPanel}>
                    <p>
                    <label>
                        Название<br/>
                        <input value={newSketch.name} onChange={(e) => {
                            if (newSketch) setNewSketch({ ...newSketch, name: e.target.value })
                        }} 
                        className={classes.Input}
                        />
                    </label>
                    </p>
                    <p>
                    <label>
                        Описание<br/>
                        <textarea value={newSketch.description} onChange={(e) => {
                            if (newSketch) setNewSketch({ ...newSketch, description: e.target.value })
                        }} 
                        className={classes.TextArea}
                        />
                    </label>
                    </p>
                    <p>
                    <label>
                        Название файла<br/>
                        <input value={newSketch.file_name} onChange={(e) => {
                            if (newSketch) setNewSketch({ ...newSketch, file_name: e.target.value })
                        }} 
                        className={classes.Input}
                        />
                    </label>
                    </p>
                    <h4>Параметры</h4>
                    <ul>
                        {
                            newSketch.params.length > 0 ?
                                <div>
                                    {
                                        newSketch.params.map(param =>
                                            <li>
                                                <div>
                                                    <p>Название: {param.name}</p>
                                                    <p>Значение по умолчанию: {param.default_value}</p>
                                                    <p>Название макроса: {param.macros_name}</p>
                                                    <p>Проверочное регулярное выражение: {param.regex == "" ? "Отсутствует" : param.regex}</p>
                                                    {
                                                        param.value_list.length > 0 ?
                                                            <>
                                                                Список возможных значений:
                                                                <ul>
                                                                    {
                                                                        param.value_list.map(value => <li>{value.value}</li>)
                                                                    }
                                                                </ul>
                                                            </>
                                                            :
                                                            <></>
                                                    }
                                                </div>
                                            </li>
                                        )
                                    }
                                </div>
                                :
                                <div>
                                    Отсутствуют
                                </div>
                        }
                    </ul>
                    <h4>Процедуры</h4>
                    <ul>
                        {
                            newSketch.procedures.length > 0 ?
                                <div>
                                    {
                                        newSketch.procedures.map(procedure =>
                                            <li>
                                                <div>
                                                    <p>Название: {procedure.name}</p>
                                                    <p>Название в коде: {procedure.procedure_name}</p>
                                                    {
                                                        procedure.args.length > 0 ?
                                                            <>
                                                                Список Агрументов:
                                                                <ul>
                                                                    {
                                                                        procedure.args.map(arg =>
                                                                            <li>
                                                                                <div>
                                                                                    <p>Название: {arg.name}</p>
                                                                                    <p>Тип данных: {arg.arg_type}</p>
                                                                                    <p>Название в коде: {arg.arg_name}</p>
                                                                                </div>
                                                                            </li>
                                                                        )
                                                                    }
                                                                </ul>
                                                            </>
                                                            :
                                                            <></>
                                                    }
                                                </div>
                                            </li>
                                        )
                                    }
                                </div>
                                :
                                <div>
                                    Отсутствуют
                                </div>
                        }
                    </ul>
                    <h4>Данные</h4>
                    <ul>
                        {
                            newSketch.datas.length > 0 ?
                                <div>
                                    {
                                        newSketch.datas.map(data =>
                                            <li>
                                                <div>
                                                    <p>Название: {data.name}</p>
                                                    <p>Тип данных: {data.data_type}</p>
                                                    <p>Название в коде: {data.data_name}</p>
                                                </div>
                                            </li>
                                        )
                                    }
                                </div>
                                :
                                <div>
                                    Отсутствуют
                                </div>
                        }
                    </ul>
                </div>
            }
            <div className={classes.BottomPanel}>
                <AccentButton onClick={() => {
                    if (newSketch == null) return;
                    createSketch(newSketch)
                    setNewSketch(null);
                    navigate("/optional/sketch-manager");
                }}>
                    Добавить
                </AccentButton>
                <SecondaryButton onClick={() => {
                    setNewSketch(null);
                    navigate("/optional/sketch-manager");
                }}>
                    Отмена
                </SecondaryButton>
            </div>
        </div>
    );
};

export default AddSketchPage;