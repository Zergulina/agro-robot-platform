import React, { useEffect, useState } from 'react';
import pageClasses from '../Page.module.css'
import classes from './AddModulePage.module.css';
import SecondaryButton from '../../ui/buttons/SecondaryButton/SecondaryButton';
import AccentButton from '../../ui/buttons/AccentButton/AccentButton';
import { useNavigate } from 'react-router-dom';
import { createModule } from '../../api/module/createModule';
import { CreateModuleRequest } from '../../types/api/module';
import { listen } from '@tauri-apps/api/event';

const AddModulePage: React.FC = () => {
    const [newModule, setNewModule] = useState<CreateModuleRequest>(() => {
        return {
            name: "Новый модуль",
            file_name: "new_module.ino",
            description: "",
            code: "",
            commands: [],
            data_requests: []
        }
    });
    const navigate = useNavigate();

    useEffect(() => {
        const setupListener = async () => {
            const unlisten = await listen<CreateModuleRequest>("create-new-module", (event) => {
                setNewModule(event.payload);
                console.log("aboba")
            })

            return () => {
                unlisten();
            }
        }
        const cleanup = setupListener();

        return () => {
            cleanup.then(un => un && un());
        };
    }, [])

    return (
        <div className={pageClasses.Page}>
            {
                newModule &&
                <div className={classes.AddSketchPanel}>
                    <p>
                        <label>
                            Название<br />
                            <input value={newModule.name} onChange={(e) => {
                                if (newModule) setNewModule({ ...newModule, name: e.target.value })
                            }}
                                className={classes.Input}
                            />
                        </label>
                    </p>
                    <p>
                        <label>
                            Описание<br />
                            <textarea value={newModule.description} onChange={(e) => {
                                if (newModule) setNewModule({ ...newModule, description: e.target.value })
                            }}
                                className={classes.TextArea}
                            />
                        </label>
                    </p>
                    <p>
                        <label>
                            Название файла<br />
                            <input value={newModule.file_name} onChange={(e) => {
                                if (newModule) setNewModule({ ...newModule, file_name: e.target.value })
                            }}
                                className={classes.Input}
                            />
                        </label>
                    </p>
                    <h4>Команды</h4>
                    <ul>
                        {
                            newModule.commands.length > 0 ?
                                <div>
                                    {
                                        newModule.commands.map(command =>
                                            <li>
                                                <div>
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
                    <h4>Запросы данных</h4>
                    <ul>
                        {
                            newModule.data_requests.length > 0 ?
                                <div>
                                    {
                                        newModule.data_requests.map(data_request =>
                                            <li>
                                                <div>
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
                </div>
            }
            <div className={classes.BottomPanel}>
                <AccentButton onClick={() => {
                    if (newModule == null) return;
                    createModule(newModule)
                    navigate("/optional/module-manager");
                }}>
                    Добавить
                </AccentButton>
                <SecondaryButton onClick={() => {
                    navigate("/optional/module-manager");
                }}>
                    Отмена
                </SecondaryButton>
            </div>
        </div>
    );
};

export default AddModulePage;