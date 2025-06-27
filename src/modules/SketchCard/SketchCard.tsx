import React from 'react';
import { SketchFullInfo } from '../../types/api/sketch';
import CompiledItemCard from '../../components/CompiledItemCard/CompiledItemCard';
import classes from './SketchCard.module.css'

type SketchCardProps = {
    sketch: SketchFullInfo;
    deleteCallback?: () => void;
    selectItemCallback?: () => void;
}

const SketchCard: React.FC<SketchCardProps> = ({ sketch, deleteCallback, selectItemCallback }) => {
    return (
        <CompiledItemCard name={sketch.name} description={sketch.description} deleteCallback={deleteCallback} selectItemCallback={selectItemCallback}>
            <div className={classes.SketchCard}>
                <h4>Параметры</h4>
                <ul>
                    {
                        sketch.params.length > 0 ?
                            <div>
                                {
                                    sketch.params.map(param =>
                                        <li>
                                            <div key={param.id}>
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
                                                                    param.value_list.map(value => <li key={value.id}>{value.value}</li>)
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
                        sketch.procedures.length > 0 ?
                            <div>
                                {
                                    sketch.procedures.map(procedure =>
                                        <li>
                                            <div key={procedure.id}>
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
                                                                            <div key={arg.id}>
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
                        sketch.datas.length > 0 ?
                            <div>
                                {
                                    sketch.datas.map(data =>
                                        <li>
                                            <div key={data.id}>
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
        </CompiledItemCard>
    );
};

export default SketchCard;