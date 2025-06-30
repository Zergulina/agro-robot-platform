import React from 'react';
import classes from './WorkspaceSelection.module.css';
import AccentButton from '../../ui/buttons/AccentButton/AccentButton';
import { DrawUnit } from '../../types/nodes/primitives/DrawUnit';
import { CheckIsOk } from '../../logic/module/checkIsOk';

type WorkspaceSelectionProps = {
    nodes: DrawUnit[];
}

const WorkspaceSelection: React.FC<WorkspaceSelectionProps> = ({nodes}) => {
    return (
        <nav className={classes.WorkspaceSelection}>
            <AccentButton onClick={() => {
                CheckIsOk(nodes);
            }}>Проверить на ошибки</AccentButton>
        </nav>
    );
};

export default WorkspaceSelection;