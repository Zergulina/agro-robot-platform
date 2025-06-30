import React from 'react';
import classes from './WorkspaceSelection.module.css';
import AccentButton from '../../ui/buttons/AccentButton/AccentButton';
import { DrawUnit } from '../../types/nodes/primitives/DrawUnit';
import { CheckIsOk } from '../../logic/module/checkIsOk';
import { compile } from '../../logic/module/compile';

type WorkspaceSelectionProps = {
    nodes: DrawUnit[];
}

const WorkspaceSelection: React.FC<WorkspaceSelectionProps> = ({nodes}) => {
    return (
        <nav className={classes.WorkspaceSelection}>
            <AccentButton onClick={() => {
                CheckIsOk(nodes);
            }}>Проверить на ошибки</AccentButton>
            <AccentButton onClick={() => {
                console.log(compile(nodes));
            }}>Сгенерировать код</AccentButton>
        </nav>
    );
};

export default WorkspaceSelection;