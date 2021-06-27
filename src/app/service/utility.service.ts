import {Injectable} from '@angular/core';
import {Triple} from '../model/triple';
import {CytoscapeOptionsExtended} from '../model/node';

@Injectable({
    providedIn: 'root'
})
export class UtilityService {

    constructor() {
    }


    static distance(x1: number, y1: number, x2: number, y2: number): number {
        return Math.sqrt(
            Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)
        );
    }

    static createConstraints(
        marioPosition: () => {x: number, y: number},
        bowserPosition: () => { x: number, y: number },
        hGrid: number,
        wGrid: number
    ): Array<Array<Triple<any>>> {
        const result: Array<Array<Triple<any>>> = [];
        result.push(
            [
                new Triple('X', '<', () => hGrid)
            ]
        );
        result.push(
            [
                new Triple('X', '>=', () => 0)
            ]
        );
        result.push(
            [
                new Triple('Y', '<', () => wGrid)
            ]
        );
        result.push(
            [
                new Triple('Y', '>=', () => 0)
            ]
        );
        result.push(
            [
                new Triple<any>('X', 'distance', () => 1, (x: number) => Math.abs(x - marioPosition().x) <= 1)
            ]
        );
        result.push(
            [
                new Triple<any>('Y', 'distance', () => 1, (x: number) => Math.abs(x - marioPosition().y) <= 1)
            ]
        );
        result.push(
            [
                new Triple('X', '!=', () => bowserPosition().x + 1, undefined, '(possibly bowser position)'),
                new Triple('Y', '!=', () => bowserPosition().y, undefined, '(possibly bowser position)')
            ]
        );
        result.push(
            [
                new Triple('X', '!=', () => bowserPosition().x - 1, undefined, '(possibly bowser position)'),
                new Triple('Y', '!=', () => bowserPosition().y, undefined, '(possibly bowser position)')
            ]
        );
        result.push(
            [
                new Triple('X', '!=', () => bowserPosition().x, undefined, '(possibly bowser position)'),
                new Triple('Y', '!=', () => bowserPosition().y + 1, undefined, '(possibly bowser position)')
            ]
        );
        result.push(
            [
                new Triple('X', '!=', () => bowserPosition().x, undefined, '(possibly bowser position)'),
                new Triple('Y', '!=', () => bowserPosition().y - 1, undefined, '(possibly bowser position)')
            ]
        );
        result.push(
            [
                new Triple('X', '!=', () => bowserPosition().x + 1, undefined, '(possibly bowser position)'),
                new Triple('Y', '!=', () => bowserPosition().y + 1, undefined, '(possibly bowser position)')
            ]
        );
        result.push(
            [
                new Triple('X', '!=', () => bowserPosition().x + 1, undefined, '(possibly bowser position)'),
                new Triple('Y', '!=', () => bowserPosition().y - 1, undefined, '(possibly bowser position)')
            ]
        );
        result.push(
            [
                new Triple('X', '!=', () => bowserPosition().x - 1, undefined, '(possibly bowser position)'),
                new Triple('Y', '!=', () => bowserPosition().y + 1, undefined, '(possibly bowser position)')
            ]
        );
        result.push(
            [
                new Triple('X', '!=', () => bowserPosition().x - 1, undefined, '(possibly bowser position)'),
                new Triple('Y', '!=', () => bowserPosition().y - 1, undefined, '(possibly bowser position)')
            ]
        );

        result.push(
            [
                new Triple('XY',
                    'isEmpty',
                    () => 0,
                    (x: number, y: number) => {
                        return this.xor(bowserPosition().x !== x, bowserPosition().y !== y);
                    }
                )
            ]
        );
        return result;
    }

    static createGraph(checkConstraints: (x: number, y: number) => () => boolean): CytoscapeOptionsExtended {
        const els: CytoscapeOptionsExtended = {
            elements: [
                {
                    data: {
                        id: 'x_yPLUS1',
                        formula: (x: number, y: number) => {
                            return checkConstraints(x, y + 1)();
                        }
                    },

                },
                {
                    data: {
                        id: 'xPLUS1_yPLUS1',
                        formula: (x: number, y: number) => {
                            return checkConstraints(x + 1, y + 1)();
                        }
                    },

                },
                {
                    data: {
                        id: 'xPLUS1_y',
                        formula: (x: number, y: number) => {
                            return checkConstraints(x + 1, y)();
                        }
                    },

                },
                {
                    data: {
                        id: 'xPLUS1_yMINUS1',
                        formula: (x: number, y: number) => {
                            return checkConstraints(x + 1, y - 1)();
                        }
                    },

                },
                {
                    data: {
                        id: 'x_yMINUS1',
                        formula: (x: number, y: number) => {
                            return checkConstraints(x, y - 1)();
                        }
                    },

                },
                {
                    data: {
                        id: 'xMINUS1_yPLUS1',
                        formula: (x: number, y: number) => {
                            return checkConstraints(x - 1, y + 1)();
                        }
                    },

                },
                {
                    data: {
                        id: 'xMINUS1_y',
                        formula: (x: number, y: number) => {
                            return checkConstraints(x - 1, y)();
                        }
                    },

                },
                {
                    data: {
                        id: 'xMINUS1_yMINUS1',
                        formula: (x: number, y: number) => {
                            return checkConstraints(x - 1, y - 1)();
                        }
                    },

                },
                // arcs
                {
                    data: {
                        id: '1',
                        source: 'x_yPLUS1',
                        target: 'xPLUS1_yPLUS1'
                    }
                },
                {
                    data: {
                        id: '2',
                        source: 'xPLUS1_yPLUS1',
                        target: 'xPLUS1_y'
                    }
                },
                {
                    data: {
                        id: '3',
                        source: 'xPLUS1_y',
                        target: 'xPLUS1_yMINUS1'
                    }
                },
                {
                    data: {
                        id: '4',
                        source: 'xPLUS1_yMINUS1',
                        target: 'x_yMINUS1'
                    }
                },

                {
                    data: {
                        id: '5',
                        source: 'x_yPLUS1',
                        target: 'xMINUS1_yPLUS1'
                    }
                },
                {
                    data: {
                        id: '6',
                        source: 'xMINUS1_yPLUS1',
                        target: 'xMINUS1_y'
                    }
                },
                {
                    data: {
                        id: '7',
                        source: 'xMINUS1_y',
                        target: 'xMINUS1_yMINUS1'
                    }
                },
                {
                    data: {
                        id: '8',
                        source: 'xMINUS1_yMINUS1',
                        target: 'x_yMINUS1'
                    }
                }
            ]
        };
        return els;
    }

    static xor(el1: boolean, el2: boolean): boolean {
        return (!el1) ? el2 : true;
    }

    static replaceAll(bean: string, toReplace: string, replacement: string): string {
        return bean.split(toReplace).join(replacement);
    }

    static getDecriptionTriple(triple: Triple<any>): string {
        return triple.resource + triple.getCondition + triple.getValue;
    }
    static getDecriptionTripleUnary(triple: Triple<any>): string {
        return triple.resource + triple.getCondition;
    }
}
