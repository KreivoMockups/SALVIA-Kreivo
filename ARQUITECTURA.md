{\rtf1\ansi\ansicpg1252\cocoartf2868
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\froman\fcharset0 Times-Roman;\f1\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue0;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c0;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs24 \cf0 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 ```
\f1 \kerning1\expnd0\expndtw0 \outl0\strokewidth0 \
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0
\cf0 erDiagram\
    Roles ||--o\{ Usuarios : tiene\
    Usuarios ||--o\{ Casos : registra\
    Casos ||--o\{ Respuestas_Valores : contiene\
    Catalogo_Preguntas ||--o\{ Respuestas_Valores : define\
    Catalogo_Preguntas ||--o\{ Arbol_Dependencias : es_padre\
    Catalogo_Preguntas ||--o\{ Arbol_Dependencias : es_hijo\
\
    Casos \{\
        string id_caso PK\
        date fecha_radicacion\
        string estado\
    \}\
    Catalogo_Preguntas \{\
        string codigo_pregunta PK\
        string etiqueta\
        string tipo_dato\
        json opciones\
    \}\
    Respuestas_Valores \{\
        int id_respuesta PK\
        string id_caso FK\
        string codigo_pregunta FK\
        string valor_respuesta\
    \}\
\pard\pardeftab720\partightenfactor0

\f0 \cf0 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 ```}