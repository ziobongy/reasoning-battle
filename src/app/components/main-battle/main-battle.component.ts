import {Component, OnInit} from '@angular/core';
import {ObjectInGrid} from '../../model/ObjectInGrid';
import {environment} from '../../../environments/environment';
import * as cytoscape from 'cytoscape';
import {NodeSingular} from 'cytoscape';
import {UtilityService} from '../../service/utility.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {faMapMarker} from '@fortawesome/free-solid-svg-icons/faMapMarker';
import {Triple} from '../../model/triple';

@Component({
    selector: 'app-main-battle',
    templateUrl: './main-battle.component.html',
    styleUrls: ['./main-battle.component.css']
})
export class MainBattleComponent implements OnInit {
    mapMarker = faMapMarker;

    private wGrid = environment.W_GRID;
    private hGrid = environment.H_GRID;

    private marioPosition: { x: number, y: number } = {x: this.hGrid - 1, y: this.wGrid - 1};
    private bowserPosition: { x: number, y: number } = {x: 0, y: 0};

    private graph: cytoscape.Core = cytoscape();
    private constraints: Array<Array<Triple<any>>> = [];

    grid: Array<Array<ObjectInGrid>> = [];
    formGroup: FormGroup;
    submitted = false;


    constructor(
        private formBuilder: FormBuilder
    ) {
        this.formGroup = this.formBuilder.group(
            {
                query: ['', [Validators.required, Validators.pattern(/^ask\ [0-9]{1}(?:[0-9]{1}){0,1}\,[0-9]{1}(?:[0-9]{1}){0,1}$/)]],
                satisfied: [{value: '', disabled: true}, []],
                unsatisfied: [{value: '', disabled: true}, []]
            }
        );
    }

    ngOnInit(): void {
        const els = UtilityService.createGraph((x, y) => () => this.checkConstraints(x, y));
        this.graph = cytoscape(els);
        // console.log(bfs.found);
        for (let i = 0; i < this.hGrid; i++) {
            this.grid[i] = [];
            for (let k = 0; k < this.wGrid; k++) {
                if (i === this.bowserPosition.x && k === this.bowserPosition.y) {
                    this.grid[i].push(
                        {
                            name: 'Bowser',
                            type: 'bowser'
                        }
                    );
                } else if (i === this.marioPosition.x && k === this.marioPosition.y) {
                    this.grid[i].push(
                        {
                            name: 'Bowser',
                            type: 'mario'
                        }
                    );
                } else {
                    this.grid[i].push(
                        {
                            name: 'pippo',
                            type: 'empty'
                        }
                    );
                }
            }
        }
        this.initializeRDF();
        this.createPossibilities();
    }

    private initializeRDF(): void {
        this.constraints = UtilityService.createConstraints(() => this.marioPosition, () => this.bowserPosition, this.hGrid, this.wGrid);
    }

    moveMario(x: number, y: number): void {
        let found = false;
        let xb = 0;
        let yb = 0;
        if (this.grid[x][y].type !== 'next_move') {
            return;
        }
        this.grid.forEach(
            (row, i) => {
                row.forEach(
                    (col, k) => {
                        if (col.type === 'mario' &&
                            (
                                (Math.abs(x - i) === 1 && Math.abs(y - k) === 1) ||
                                (Math.abs(x - i) === 1 && Math.abs(y - k) === 0) ||
                                (Math.abs(x - i) === 0 && Math.abs(y - k) === 1)
                            )
                        ) {
                            col.type = 'empty';
                            found = true;
                        }
                        if (col.type === 'bowser') {
                            xb = i;
                            yb = k;
                        }
                    }
                );
            }
        );
        if (found) {
            this.grid[x][y] = {
                name: 'pippo',
                type: 'mario'
            };
            this.marioPosition = {
                x, y
            };
            this.moveBowser(x, y, xb, yb);
        }


    }

    // x e y rappresentano la nuova posizione di mario
    private moveBowser(x: number, y: number, bx: number, by: number): void {
        const operations = ['+', '-'];
        const bowserx = bx;
        const bowsery = by;
        let min = Math.max(this.hGrid, this.wGrid) * 2;
        let nextx = bx;
        let nexty = by;
        for (const opX of operations) {
            for (const opY of operations) {
                /*let nextcelx = eval(bowserx + opX + '1');
                let nextcely = eval(bowsery + opY + '1');
                let actualDist = this.distance(x, y, nextcelx, nextcely);
                if (actualDist < min) {
                    min = actualDist;
                    nextx = nextcelx;
                    nexty = nextcely;
                }*/
                // tslint:disable-next-line:no-eval
                let nextcelx = eval(bowserx + opX + '1');
                // tslint:disable-next-line:no-eval
                let nextcely = eval(bowsery + opY + '0');
                let actualDist = UtilityService.distance(x, y, nextcelx, nextcely);
                if (actualDist < min) {
                    min = actualDist;
                    nextx = nextcelx;
                    nexty = nextcely;
                }
                // tslint:disable-next-line:no-eval
                nextcelx = eval(bowserx + opX + '0');
                // tslint:disable-next-line:no-eval
                nextcely = eval(bowsery + opY + '1');
                actualDist = UtilityService.distance(x, y, nextcelx, nextcely);
                if (actualDist < min) {
                    min = actualDist;
                    nextx = nextcelx;
                    nexty = nextcely;
                }
            }
        }
        this.grid[bx][by] = {
            name: '',
            type: 'empty'
        };
        this.grid[nextx][nexty] = {
            name: '',
            type: 'bowser'
        };
        this.bowserPosition = {
            x: nextx,
            y: nexty
        };
        this.createPossibilities();
    }


    private createPossibilities(): void {
        const resultNodes: NodeSingular[] = [];

        // eseguo la BFS sul grafo
        const bfs = this.graph.elements().bfs(
            {
                root: '#x_yPLUS1',
                visit: (v, e, u, i, depth) => {
                    const resultNode = v.data().formula(
                        this.marioPosition.x,
                        this.marioPosition.y,
                    );
                    if (resultNode) {
                        resultNodes.push(v);
                    }
                    return;
                },
                directed: true
            }
        );
        this.clearGrid();
        if (resultNodes.length === 0) {
            setTimeout(
                () => {
                    alert('Game Over');
                }
            );
        }
        // per ognuno dei nodi trovati, quindi che soddisfa i vincoli, inserisco la "next move"
        resultNodes.forEach(
            node => {
                const splittedName: Array<string> = node.id().split('_');
                // quindi dobbiamo avere due posizioni, 1 x e 2 y
                const operationX = splittedName[0];
                const operationY = splittedName[1];
                if (operationX.includes('PLUS')) {
                    if (operationY.includes('PLUS')) {
                        this.grid[this.marioPosition.x + 1][this.marioPosition.y + 1] = {
                            name: '',
                            type: 'next_move'
                        };
                    } else if (operationY.includes('MINUS')) {
                        this.grid[this.marioPosition.x + 1][this.marioPosition.y - 1] = {
                            name: '',
                            type: 'next_move'
                        };
                    } else {
                        this.grid[this.marioPosition.x + 1][this.marioPosition.y] = {
                            name: '',
                            type: 'next_move'
                        };
                    }
                } else if (operationX.includes('MINUS')) {
                    if (operationY.includes('PLUS')) {
                        this.grid[this.marioPosition.x - 1][this.marioPosition.y + 1] = {
                            name: '',
                            type: 'next_move'
                        };
                    } else if (operationY.includes('MINUS')) {
                        this.grid[this.marioPosition.x - 1][this.marioPosition.y - 1] = {
                            name: '',
                            type: 'next_move'
                        };
                    } else {
                        this.grid[this.marioPosition.x - 1][this.marioPosition.y] = {
                            name: '',
                            type: 'next_move'
                        };
                    }
                } else {
                    if (operationY.includes('PLUS')) {
                        this.grid[this.marioPosition.x][this.marioPosition.y + 1] = {
                            name: '',
                            type: 'next_move'
                        };
                    } else if (operationY.includes('MINUS')) {
                        this.grid[this.marioPosition.x][this.marioPosition.y - 1] = {
                            name: '',
                            type: 'next_move'
                        };
                    } else {
                        this.grid[this.marioPosition.x][this.marioPosition.y] = {
                            name: '',
                            type: 'next_move'
                        };
                    }
                }
            }
        );
    }

    private checkConstraints(x: number, y: number): boolean {
        let result = true;
        this.constraints.forEach(
            row => {
                if (row.length === 1) {
                    if (row[0].isUnary) {
                        if (row[0].resource.length === 1) {
                            result = result && row[0].computeUNary(row[0].resource === 'X' ? x : y);
                        } else {
                            result = result && row[0].computeUNary(x, y);
                        }
                    } else {
                        result = result && row[0].compute(row[0].resource === 'X' ? x : y);
                    }
                } else {
                    result = result &&
                        UtilityService.xor(
                            row[0].compute((row[0].resource === 'X' ? x : y)),
                            row[1].compute((row[1].resource === 'X' ? x : y))
                        );
                }

            }
        );
        return result;
    }

    private clearGrid(): void {
        this.grid.forEach(
            (row, i) => {
                row.forEach(
                    (col, k) => {
                        if (col.type !== 'mario' && col.type !== 'bowser' && col.type !== 'block') {
                            this.grid[i][k] = {
                                name: '',
                                type: 'empty'
                            };
                        }
                    }
                );
            }
        );
    }

    demostration(): void {
        this.submitted = true;
        if (!this.formGroup.valid) {
            return;
        }
        /*const satisfied: NodeSingular[] = [];
        const unsatisfied: NodeSingular[] = [];*/
        const numberDivisor = 15;
        const divisor = '-'.repeat(numberDivisor);
        let resultSatisfied = '';
        let resultUnsatisfied = '';
        const input: string[] = this.formGroup.get('query')?.value.split('ask')[1].trim().split(',');
        const x = Number(input[0]);
        const y = Number(input[1]);

        // eseguo la BFS sul grafo
        this.constraints.forEach(
            row => {
                if (row.length === 1) {
                    if (row[0].isUnary) {
                        if (row[0].resource.length === 1) {
                            if (row[0].computeUNary(row[0].resource === 'X' ? x : y)) {
                                resultSatisfied += divisor + '\n';
                                resultSatisfied += UtilityService.getDecriptionTriple(row[0]) + '\n';
                            } else {
                                resultUnsatisfied += divisor + '\n';
                                resultUnsatisfied += UtilityService.getDecriptionTriple(row[0]) + '\n';
                            }
                        } else {
                            if (row[0].computeUNary(x, y)) {
                                resultSatisfied += divisor + '\n';
                                resultSatisfied += UtilityService.getDecriptionTripleUnary(row[0]) + '\n';
                            } else {
                                resultUnsatisfied += divisor + '\n';
                                resultUnsatisfied += UtilityService.getDecriptionTripleUnary(row[0]) + '\n';
                            }
                        }
                    } else {
                        if (row[0].compute(row[0].resource === 'X' ? x : y)) {
                            resultSatisfied += divisor + '\n';
                            resultSatisfied += UtilityService.getDecriptionTriple(row[0]) + '\n';
                        } else {
                            resultUnsatisfied += divisor + '\n';
                            resultUnsatisfied += UtilityService.getDecriptionTriple(row[0]) + '\n';
                        }
                    }
                } else {
                    const result =
                        UtilityService.xor(
                            row[0].compute((row[0].resource === 'X' ? x : y)),
                            row[1].compute((row[1].resource === 'X' ? x : y))
                        );
                    if (result) {
                        resultSatisfied += divisor + '\n';
                        resultSatisfied +=
                            UtilityService.getDecriptionTriple(row[0]) +
                            ((row[1].getDescription != null) ? row[1].getDescription : '') +
                            '\n\tXOR\n' +
                            UtilityService.getDecriptionTriple(row[1]) +
                            ((row[1].getDescription != null) ? row[1].getDescription : '') +
                            '\n';
                    } else {
                        resultUnsatisfied += divisor + '\n';
                        resultUnsatisfied +=
                            UtilityService.getDecriptionTriple(row[0]) +
                            ((row[1].getDescription != null) ? row[1].getDescription : '') +
                            '\n\tXOR\n' +
                            UtilityService.getDecriptionTriple(row[1]) +
                            ((row[1].getDescription != null) ? row[1].getDescription : '') +
                            '\n';
                    }
                    // (!row[0].compute((row[0].resource === 'X' ? x : y)) ? row[1].compute((row[1].resource === 'X' ? x : y)) : true);
                }
            }
        );
        resultSatisfied += divisor;
        resultUnsatisfied += divisor;
        /*satisfied.forEach(
            el => {
                resultSatisfied += el.id().split('PLUS').join('+').split('MINUS').join('-').split('_').join('/') + '\n';
            }
        );
        unsatisfied.forEach(
            el => {
                resultUnsatisfied += el.id().split('PLUS').join('+').split('MINUS').join('-').split('_').join('/') + '\n';
            }
        );*/
        this.formGroup.get('satisfied')?.setValue(resultSatisfied);
        this.formGroup.get('unsatisfied')?.setValue(resultUnsatisfied);
    }
}
