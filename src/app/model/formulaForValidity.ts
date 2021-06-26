export interface FormulaForValidity {
    variable1?: string;
    operation: '>' | '<' | '>=' | '<=' | '!=' | '==';
    variable2?: string;
}
