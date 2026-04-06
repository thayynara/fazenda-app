cat > src/database/db.js << 'EOF'
import * as SQLite from 'expo-sqlite';

let db = null;

export async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('fazenda.db');
    await initDb(db);
  }
  return db;
}

async function initDb(db) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS Funcionarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      apelido TEXT,
      funcao TEXT,
      valor_diaria REAL NOT NULL DEFAULT 0,
      chave_pix TEXT,
      tipo_chave_pix TEXT,
      telefone TEXT,
      observacao TEXT,
      ativo INTEGER NOT NULL DEFAULT 1,
      criado_em TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Lancamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL,
      funcionario_id INTEGER NOT NULL,
      situacao TEXT NOT NULL,
      valor_base REAL NOT NULL DEFAULT 0,
      valor_extra REAL NOT NULL DEFAULT 0,
      valor_final REAL NOT NULL DEFAULT 0,
      observacao TEXT,
      criado_em TEXT NOT NULL,
      FOREIGN KEY (funcionario_id) REFERENCES Funcionarios(id)
    );

    CREATE TABLE IF NOT EXISTS Fechamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_inicio TEXT NOT NULL,
      data_fim TEXT NOT NULL,
      funcionario_id INTEGER NOT NULL,
      dias_trabalhados INTEGER NOT NULL DEFAULT 0,
      faltas INTEGER NOT NULL DEFAULT 0,
      meias_diarias INTEGER NOT NULL DEFAULT 0,
      extras INTEGER NOT NULL DEFAULT 0,
      total_pagar REAL NOT NULL DEFAULT 0,
      pago INTEGER NOT NULL DEFAULT 0,
      data_pagamento TEXT,
      FOREIGN KEY (funcionario_id) REFERENCES Funcionarios(id)
    );
  `);
}

export async function inserirFuncionario(f) {
  const db = await getDb();
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO Funcionarios (nome, apelido, funcao, valor_diaria, chave_pix, tipo_chave_pix, telefone, observacao, ativo, criado_em)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    [f.nome, f.apelido||null, f.funcao||null, f.valor_diaria, f.chave_pix||null,
     f.tipo_chave_pix||null, f.telefone||null, f.observacao||null, now]
  );
  return result.lastInsertRowId;
}

export async function atualizarFuncionario(f) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE Funcionarios SET nome=?, apelido=?, funcao=?, valor_diaria=?, chave_pix=?,
     tipo_chave_pix=?, telefone=?, observacao=?, ativo=? WHERE id=?`,
    [f.nome, f.apelido||null, f.funcao||null, f.valor_diaria, f.chave_pix||null,
     f.tipo_chave_pix||null, f.telefone||null, f.observacao||null, f.ativo, f.id]
  );
}

export async function excluirFuncionario(id) {
  const db = await getDb();
  await db.runAsync('DELETE FROM Lancamentos WHERE funcionario_id = ?', [id]);
  await db.runAsync('DELETE FROM Fechamentos WHERE funcionario_id = ?', [id]);
  await db.runAsync('DELETE FROM Funcionarios WHERE id = ?', [id]);
}

export async function listarFuncionarios(apenasAtivos = false) {
  const db = await getDb();
  const query = apenasAtivos
    ? 'SELECT * FROM Funcionarios WHERE ativo = 1 ORDER BY nome'
    : 'SELECT * FROM Funcionarios ORDER BY ativo DESC, nome';
  return await db.getAllAsync(query);
}

export async function buscarFuncionario(id) {
  const db = await getDb();
  return await db.getFirstAsync('SELECT * FROM Funcionarios WHERE id = ?', [id]);
}

export function calcularValor(situacao, valor_diaria, valor_extra = 0) {
  switch (situacao) {
    case 'P': return valor_diaria;
    case 'F': return 0;
    case 'M': return valor_diaria * 0.5;
    case 'E': return valor_diaria + (parseFloat(valor_extra) || 0);
    default:  return 0;
  }
}

export async function salvarLancamento(data, funcionario_id, situacao, valor_base, valor_extra = 0, observacao = '') {
  const db = await getDb();
  const valor_final = calcularValor(situacao, valor_base, valor_extra);
  const now = new Date().toISOString();
  const existente = await db.getFirstAsync(
    'SELECT id FROM Lancamentos WHERE data = ? AND funcionario_id = ?',
    [data, funcionario_id]
  );
  if (existente) {
    await db.runAsync(
      `UPDATE Lancamentos SET situacao=?, valor_base=?, valor_extra=?, valor_final=?, observacao=? WHERE id=?`,
      [situacao, valor_base, valor_extra, valor_final, observacao, existente.id]
    );
  } else {
    await db.runAsync(
      `INSERT INTO Lancamentos (data, funcionario_id, situacao, valor_base, valor_extra, valor_final, observacao, criado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [data, funcionario_id, situacao, valor_base, valor_extra, valor_final, observacao, now]
    );
  }
}

export async function listarLancamentosPorData(data) {
  const db = await getDb();
  return await db.getAllAsync(
    `SELECT l.*, f.nome, f.apelido, f.valor_diaria
     FROM Lancamentos l
     JOIN Funcionarios f ON f.id = l.funcionario_id
     WHERE l.data = ? ORDER BY f.nome`,
    [data]
  );
}

export async function buscarLancamento(id) {
  const db = await getDb();
  return await db.getFirstAsync(
    `SELECT l.*, f.nome, f.apelido, f.valor_diaria
     FROM Lancamentos l
     JOIN Funcionarios f ON f.id = l.funcionario_id
     WHERE l.id = ?`,
    [id]
  );
}

export async function excluirLancamento(id) {
  const db = await getDb();
  await db.runAsync('DELETE FROM Lancamentos WHERE id = ?', [id]);
}

export async function calcularFechamento(dataInicio, dataFim) {
  const db = await getDb();
  return await db.getAllAsync(
    `SELECT
       f.id AS funcionario_id, f.nome, f.apelido, f.chave_pix, f.tipo_chave_pix,
       COUNT(CASE WHEN l.situacao IN ('P','E') THEN 1 END) AS dias_trabalhados,
       COUNT(CASE WHEN l.situacao = 'F' THEN 1 END) AS faltas,
       COUNT(CASE WHEN l.situacao = 'M' THEN 1 END) AS meias_diarias,
       COUNT(CASE WHEN l.situacao = 'E' THEN 1 END) AS extras,
       COALESCE(SUM(l.valor_final), 0) AS total_pagar
     FROM Funcionarios f
     LEFT JOIN Lancamentos l
       ON l.funcionario_id = f.id AND l.data >= ? AND l.data <= ?
     WHERE f.ativo = 1
     GROUP BY f.id ORDER BY f.nome`,
    [dataInicio, dataFim]
  );
}

export async function calcularRelatorioMensal(ano, mes) {
  const inicio = `${ano}-${String(mes).padStart(2,'0')}-01`;
  const fim    = `${ano}-${String(mes).padStart(2,'0')}-31`;
  return calcularFechamento(inicio, fim);
}

export async function resumoDia(data) {
  const db = await getDb();
  return await db.getFirstAsync(
    `SELECT
       COUNT(CASE WHEN situacao='P' THEN 1 END) AS presentes,
       COUNT(CASE WHEN situacao='F' THEN 1 END) AS faltas,
       COUNT(CASE WHEN situacao='M' THEN 1 END) AS meias,
       COUNT(CASE WHEN situacao='E' THEN 1 END) AS extras,
       COALESCE(SUM(valor_final),0) AS total_dia
     FROM Lancamentos WHERE data = ?`,
    [data]
  );
}
EOF