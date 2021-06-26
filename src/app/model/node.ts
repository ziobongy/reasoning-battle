import {FormulaForValidity} from './formulaForValidity';
import {CytoscapeOptions, ElementDefinition, NodeDataDefinition} from 'cytoscape';

export interface Node extends NodeDataDefinition{
    formula?: (friendX: number, friendY: number) => boolean;
}

export interface ElementDefinitionExtended extends ElementDefinition {
    data: Node;
}

export interface CytoscapeOptionsExtended extends CytoscapeOptions {
    elements: Array<ElementDefinitionExtended>;
}
