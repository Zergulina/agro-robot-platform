import React from 'react';
import classes from './WorkspaceSelection.module.css';
import AccentButton from '../../ui/buttons/AccentButton/AccentButton';
import { DrawUnit } from '../../types/nodes/primitives/DrawUnit';
import { CheckIsOk } from '../../logic/module/checkIsOk';
import { compile } from '../../logic/module/compile';
import { emit } from '@tauri-apps/api/event';
import { Command } from '../../types/nodes/input/Command';
import { DataRequest } from '../../types/nodes/output/DataRequest';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { CreateModuleRequest, Module } from '../../types/api/module';

type WorkspaceSelectionProps = {
    nodes: DrawUnit[];
}

const WorkspaceSelection: React.FC<WorkspaceSelectionProps> = ({ nodes }) => {

    return (
        <nav className={classes.WorkspaceSelection}>
            <AccentButton onClick={() => {
                try {
                    CheckIsOk(nodes);
                    emit("notification", {
                        id: 0,
                        type: 'success',
                        message: "Ошибок не выявлено"
                    })
                } catch (e) {
                    if (e instanceof Error) {
                        console.error(e);
                        emit("notification", {
                            id: 0,
                            type: 'error',
                            message: e.message
                        })
                    }
                }
            }}>Проверить на ошибки</AccentButton>
            <AccentButton onClick={() => {
                try {
                    let code = compile(nodes)

                    let commands = nodes.filter(node => node instanceof Command).map(command => {
                        let commandArgs = command.commandArgs.map(arg => {
                            return {
                                arg_name: arg.arg_name,
                                arg_type: arg.type,
                                name: arg.name
                            }
                        })
                        return {
                            command_name: command.programCommandName,
                            name: command.commandName,
                            args: commandArgs
                        }
                    })

                    let dataRequests = nodes.filter(node => node instanceof DataRequest).map(dataRequest => {
                        return {
                            data_request_name: dataRequest.programDataRequestName,
                            name: dataRequest.dataRequestName,
                            data_request_type: dataRequest.type
                        }
                    })

                    const w = new WebviewWindow('optional', {
                        url: 'optional/module-manager/add',
                        width: 600, height: 400,
                        decorations: false,
                    });

                    w.once('tauri://created', () => console.log('OK'));
                    w.once('tauri://error', e => console.error(e));

                    setTimeout(() => {
                        emit<CreateModuleRequest>("create-new-module", {
                            name: "Новый модуль",
                            file_name: "new_module.ino",
                            description: "",
                            code: code,
                            commands: commands,
                            data_requests: dataRequests
                        })
                    }, 500);

                } catch (e) {
                    if (e instanceof Error) {
                        console.error(e)
                        emit("notification", {
                            id: 0,
                            type: 'error',
                            message: e.message
                        })
                    }
                }
            }}>Сгенерировать код</AccentButton>
        </nav>
    );
};

export default WorkspaceSelection;