import { Token } from "./Token";
import {TokenType as TT} from "./TokenType";
import { error } from ".";
import { join } from "path";

export class Scanner {
    source: string;
    tokens: Token[] = [];
    start: number = 0;
    current: number = 0;
    line: number = 1;

    keywords: Map<string,TT> = new Map([
        ["and", TT.AND],
        ["class", TT.CLASS],
        ["else", TT.ELSE],
        ["false", TT.FALSE],
        ["for", TT.FOR],
        ["fun", TT.FUN],
        ["if", TT.IF],
        ["nil", TT.NIL],
        ["or", TT.OR],
        ["print", TT.PRINT],
        ["return", TT.RETURN],
        ["super", TT.SUPER],
        ["this", TT.THIS],
        ["true", TT.TRUE],
        ["var", TT.VAR],
        ["while", TT.WHILE]
    ]);

    constructor(source: string) {
        this.source = source;
    }

    isAtEnd(): boolean{
        return this.current >= this.source.length;
    }

    advance(): string{      
        // Get char at current index and then advance the current pointer          
        return this.source.charAt(this.current++);
    }

    addToken(type: TT, literal?: any): void {
        const text: string = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal, this.line));
    }

    match(expected: string): boolean {
        if (this.isAtEnd()) return false;        
        if (this.source.charAt(this.current) !== expected) return false;

        this.current++;
        return true;
    }

    peek(): string {
        if (this.isAtEnd()) return '\0';
        return this.source.charAt(this.current);
    }

    peekNext(): string {
        if (this.current + 1 >= this.source.length ) return '\0';
        return this.source.charAt(this.current + 1); 
    }

    str(): void {
        while (this.peek() !== '"' && !this.isAtEnd()) {
            if (this.peek() === '\n') {
                this.line++;
            }
            this.advance();
        }

        if (this.isAtEnd()) {
            error(this.line, 'Unterminated string.');
            return;
        }

        // The closing "
        this.advance();

        // Trim the surrounding quotes.
        const value = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(TT.STRING, value);
    }

    isDigit(char: string): boolean {
        return !isNaN(Number(char));
    }

    number(): void {
        while (this.isDigit(this.peek())) this.advance();

        // Look for a fractional part.
        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            this.advance();

            while (this.isDigit(this.peek())) this.advance();
        }
        this.addToken(TT.NUMBER, Number(this.source.substring(this.start, this.current)))
    }

    isAlpha(c: string): boolean {
        const code = c.charCodeAt(0);
        return (code >= 65 && code <= 90) //Uppercase letters
            || (code >= 97 && code <= 122) //Lowercase letters
            || (code === 95); // _ character 
    }

    isAlphaNumeric(c: string): boolean {
        return this.isAlpha(c) || this.isDigit(c);
    }

    identifier(): void {
        while(this.isAlphaNumeric(this.peek())) this.advance();

        const text = this.source.substring(this.start, this.current);
        const type = this.keywords.get(text) || TT.IDENTIFIER;

        this.addToken(type);
    }

    scanToken(): void {
        const c = this.advance();        
        switch(c) {
            case '(': this.addToken(TT.LEFT_PAREN); break;
            case ')': this.addToken(TT.RIGHT_PAREN); break;
            case '{': this.addToken(TT.LEFT_BRACE); break;
            case '}': this.addToken(TT.RIGHT_BRACE); break;
            case ',': this.addToken(TT.COMMA); break;
            case '.': this.addToken(TT.DOT); break;
            case '-': this.addToken(TT.MINUS); break;
            case '+': this.addToken(TT.PLUS); break;
            case ';': this.addToken(TT.SEMICOLON); break;
            case '*': this.addToken(TT.STAR); break;
            case '!': 
                this.addToken(this.match('=') ? TT.BANG_EQUAL : TT.BANG);
                break;
            case '=':
                this.addToken(this.match('=') ? TT.EQUAL_EQUAL : TT.EQUAL);
                break;
            case '<':
                this.addToken(this.match('=') ? TT.LESS_EQUAL : TT.LESS);
                break;
            case '>':
                this.addToken(this.match('=') ? TT.GREATER_EQUAL : TT.GREATER);
                break;
            case '/':
                if (this.match('/')) {
                    // A comment goes until the end of the line
                    while(this.peek() !== '\n' && !this.isAtEnd()) {
                        this.advance();
                    }
                } else {
                    this.addToken(TT.SLASH);
                }
                break;
            case ' ':
            case '\r':
            case '\t':
                // Ignore whitespace
                break;            
            case '\n': this.line++; break;
            case '"': this.str(); break;            
            default:
                if (this.isDigit(c)) {
                    this.number();
                } else if (this.isAlpha(c)) {
                    this.identifier();
                } else {
                    error(this.line, 'Unexpected character.'); 
                }
                break;

        }
    }

    scanTokens(): Token[] {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }
        this.tokens.push(new Token(TT.EOF, '', null, this.line));        
        return this.tokens;
    }
}

