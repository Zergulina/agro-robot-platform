import React from 'react';
import CompiledItemCard from '../../components/CompiledItemCard/CompiledItemCard';
import classes from './ModuleCard.module.css'
import { Module } from '../../types/api/module';
import AccentButton from '../../ui/buttons/AccentButton/AccentButton';

type ModuleCardProps = {
    module: Module;
    deleteCallback?: () => void;
    selectItemCallback?: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, deleteCallback, selectItemCallback }) => {
    return (
        <CompiledItemCard name={module.name} description={module.description} deleteCallback={deleteCallback} selectItemCallback={selectItemCallback}>
            <div className={classes.ModuleCard}>
                <h4>Команды</h4>
                <ul>
                    {
                        module.commands.length > 0 ?
                            <div>
                                {
                                    module.commands.map(command =>
                                        <li>
                                            <div key={command.id}>
                                                <p>Название: {command.name}</p>
                                                <p>Название в коде: {command.command_name}</p>
                                                {
                                                    command.args.length > 0 ?
                                                        <>
                                                            Список Агрументов:
                                                            <ul>
                                                                {
                                                                    command.args.map(arg =>
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
                <h4>Запросы данных</h4>
                <ul>
                    {
                        module.data_requests.length > 0 ?
                            <div>
                                {
                                    module.data_requests.map(data_request =>
                                        <li>
                                            <div key={data_request.id}>
                                                <p>Название: {data_request.name}</p>
                                                <p>Тип данных: {data_request.data_request_type}</p>
                                                <p>Название в коде: {data_request.data_request_name}</p>
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
                <AccentButton onClick={() => {
                    console.log(module.code)
                    const blob = new Blob([module.code], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);

                    const a = document.createElement('a');
                    a.href = url;
                    a.download = module.file_name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);

                    URL.revokeObjectURL(url);
                }}>Скачать</AccentButton>
            </div>
        </CompiledItemCard>
    );
};

export default ModuleCard;