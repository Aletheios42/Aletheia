\documentclass{article}
\usepackage[utf8]{inputenc}
\usepackage{amsmath}
\usepackage{amsfonts}
\usepackage{amssymb}
\usepackage{amsthm}

\begin{document}

\section{Fundamentos de Cálculo Diferencial}

El cálculo diferencial es una rama fundamental de las matemáticas que estudia las tasas de cambio instantáneas y las pendientes de curvas. Este campo matemático, desarrollado independientemente por Newton y Leibniz en el siglo XVII, constituye la base para el análisis moderno.

\subsection{Definición Rigurosa de Derivada}

Sea $f: \mathbb{R} \to \mathbb{R}$ una función definida en un intervalo abierto que contiene al punto $a$. La \textbf{derivada} de $f$ en el punto $a$ se define como:

\[
f'(a) = \lim_{h \to 0} \frac{f(a+h) - f(a)}{h}
\]

siempre que este límite exista y sea finito.

\textbf{Interpretación geométrica:} La derivada $f'(a)$ representa la pendiente de la recta tangente a la gráfica de $f$ en el punto $(a, f(a))$.

\textbf{Interpretación física:} Si $f(t)$ representa la posición de una partícula en el tiempo $t$, entonces $f'(t)$ es la velocidad instantánea en el tiempo $t$.

\subsection{Reglas Fundamentales de Derivación}

\subsubsection{Regla de la Suma}
Si $f$ y $g$ son diferenciables en $x$, entonces:
\[
(f + g)'(x) = f'(x) + g'(x)
\]

\subsubsection{Regla del Producto}
Para funciones $u(x)$ y $v(x)$ diferenciables:
\[
(u \cdot v)'(x) = u'(x) \cdot v(x) + u(x) \cdot v'(x)
\]

\textbf{Demostración:}
\begin{align}
(uv)'(x) &= \lim_{h \to 0} \frac{u(x+h)v(x+h) - u(x)v(x)}{h} \\
&= \lim_{h \to 0} \frac{u(x+h)v(x+h) - u(x)v(x+h) + u(x)v(x+h) - u(x)v(x)}{h} \\
&= \lim_{h \to 0} \left[ v(x+h) \frac{u(x+h) - u(x)}{h} + u(x) \frac{v(x+h) - v(x)}{h} \right] \\
&= v(x)u'(x) + u(x)v'(x)
\end{align}

\subsubsection{Regla del Cociente}
Para $v(x) \neq 0$:
\[
\left(\frac{u}{v}\right)'(x) = \frac{u'(x)v(x) - u(x)v'(x)}{[v(x)]^2}
\]

\subsubsection{Regla de la Cadena}
Si $f$ es diferenciable en $g(x)$ y $g$ es diferenciable en $x$, entonces:
\[
(f \circ g)'(x) = f'(g(x)) \cdot g'(x)
\]

\subsection{Derivadas de Funciones Elementales}

\begin{itemize}
    \item \textbf{Función potencia:} $\frac{d}{dx}[x^n] = nx^{n-1}$
    \item \textbf{Función exponencial:} $\frac{d}{dx}[e^x] = e^x$
    \item \textbf{Función logarítmica:} $\frac{d}{dx}[\ln x] = \frac{1}{x}$
    \item \textbf{Funciones trigonométricas:}
    \begin{align}
        \frac{d}{dx}[\sin x] &= \cos x \\
        \frac{d}{dx}[\cos x] &= -\sin x \\
        \frac{d}{dx}[\tan x] &= \sec^2 x
    \end{align}
\end{itemize}

\subsection{Aplicaciones del Cálculo Diferencial}

\subsubsection{Análisis de Funciones}
Para una función $f(x)$ diferenciable:

\textbf{Puntos críticos:} Valores de $x$ donde $f'(x) = 0$ o $f'(x)$ no existe.

\textbf{Criterio de la primera derivada:}
\begin{itemize}
    \item Si $f'(x) > 0$ en un intervalo, entonces $f$ es creciente
    \item Si $f'(x) < 0$ en un intervalo, entonces $f$ es decreciente
\end{itemize}

\textbf{Criterio de la segunda derivada:}
Sea $c$ un punto crítico con $f'(c) = 0$:
\begin{itemize}
    \item Si $f''(c) > 0$, entonces $f$ tiene un mínimo local en $c$
    \item Si $f''(c) < 0$, entonces $f$ tiene un máximo local en $c$
    \item Si $f''(c) = 0$, el criterio no es concluyente
\end{itemize}

\subsubsection{Ejemplo Completo: Optimización}

\textbf{Problema:} Encontrar las dimensiones de un rectángulo de perímetro $P = 20$ que maximice su área.

\textbf{Solución:}
Sea $x$ el ancho y $y$ el largo del rectángulo.

Restricción: $2x + 2y = 20 \Rightarrow y = 10 - x$

Función objetivo: $A(x) = xy = x(10-x) = 10x - x^2$

Para $0 < x < 10$.

Derivando: $A'(x) = 10 - 2x$

Punto crítico: $A'(x) = 0 \Rightarrow x = 5$

Segunda derivada: $A''(x) = -2 < 0$

Por tanto, $x = 5$ da un máximo. Las dimensiones óptimas son $5 \times 5$.

\subsection{Teoremas Fundamentales}

\textbf{Teorema de Rolle:} Si $f$ es continua en $[a,b]$, diferenciable en $(a,b)$ y $f(a) = f(b)$, entonces existe $c \in (a,b)$ tal que $f'(c) = 0$.

\textbf{Teorema del Valor Medio:} Si $f$ es continua en $[a,b]$ y diferenciable en $(a,b)$, entonces existe $c \in (a,b)$ tal que:
\[
f'(c) = \frac{f(b) - f(a)}{b - a}
\]

\textbf{Regla de L'Hôpital:} Si $\lim_{x \to a} f(x) = \lim_{x \to a} g(x) = 0$ (o $\pm\infty$) y $g'(x) \neq 0$ cerca de $a$, entonces:
\[
\lim_{x \to a} \frac{f(x)}{g(x)} = \lim_{x \to a} \frac{f'(x)}{g'(x)}
\]

\subsection{Ejercicio Propuesto}

Demostrar que la función $f(x) = x^3 - 3x^2 + 2x + 1$ tiene exactamente dos puntos críticos y clasificarlos.

\textbf{Solución:}
$f'(x) = 3x^2 - 6x + 2$

Igualando a cero: $3x^2 - 6x + 2 = 0$

Usando la fórmula cuadrática:
\[
x = \frac{6 \pm \sqrt{36 - 24}}{6} = \frac{6 \pm 2\sqrt{3}}{6} = 1 \pm \frac{\sqrt{3}}{3}
\]

Los puntos críticos son $x_1 = 1 - \frac{\sqrt{3}}{3}$ y $x_2 = 1 + \frac{\sqrt{3}}{3}$.

Para clasificarlos: $f''(x) = 6x - 6$

$f''(x_1) = 6(1 - \frac{\sqrt{3}}{3}) - 6 = -2\sqrt{3} < 0$ (máximo local)

$f''(x_2) = 6(1 + \frac{\sqrt{3}}{3}) - 6 = 2\sqrt{3} > 0$ (mínimo local)

\end{document}
