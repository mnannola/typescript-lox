import { Visitor, Expr, Binary, Grouping, Literal, Unary } from "./Expr";
import { Token } from "./Token";
import { TokenType } from "./TokenType";

class AstPrinter implements Visitor<String> {
    visitBinaryExpr(expr: Binary): String {
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
    }
    visitGroupingExpr(expr: Grouping): String {
        return this.parenthesize("group", expr.expression);
    }
    visitLiteralExpr(expr: Literal): String {
        if (expr.value === null) return "nil";
        return expr.value.toString();
    }
    visitUnaryExpr(expr: Unary): String {
        return this.parenthesize(expr.operator.lexeme, expr.right);
    }
    print(expr: Expr): String {
        return expr.accept(this);
    }
    
    parenthesize(name: String, ...exprs: Expr[]): String {
        const builderArr = [];
    
        builderArr.push("(");
        builderArr.push(name);
    
        for (const expr of exprs) {
            builderArr.push(" ");
            builderArr.push(expr.accept(this));        
        }
        builderArr.push(")");
    
        return builderArr.join('').toString();
    }
}

function main(): void {
    const expression: Expr = new Binary(
        new Unary(
            new Token(TokenType.MINUS, "-", null, 1),
            new Literal(123)),
        new Token(TokenType.STAR, "*", null, 1),
        new Grouping(
            new Literal(45.67)
        )
    );
    
    console.log(new AstPrinter().print(expression));
}

main();
