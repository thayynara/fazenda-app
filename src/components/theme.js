import { StyleSheet } from 'react-native';

export const CORES = {
  P: '#2E7D32', P_BG: '#E8F5E9',
  F: '#C62828', F_BG: '#FFEBEE',
  M: '#F9A825', M_BG: '#FFFDE7',
  E: '#1565C0', E_BG: '#E3F2FD',
  primary: '#2E7D32',
  fundo: '#F5F5F0',
  branco: '#FFFFFF',
  texto: '#1A1A1A',
  textoSecundario: '#666',
  borda: '#DDD',
  perigo: '#C62828',
};

export const LABELS_SITUACAO = {
  P: 'Presente', F: 'Falta', M: 'Meia diária', E: 'Extra',
};

export const estilosGlobais = StyleSheet.create({
  container: { flex: 1, backgroundColor: CORES.fundo },
  card: {
    backgroundColor: CORES.branco, borderRadius: 12,
    padding: 16, marginHorizontal: 16, marginVertical: 6,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  titulo:    { fontSize: 20, fontWeight: '700', color: CORES.texto },
  subtitulo: { fontSize: 16, fontWeight: '600', color: CORES.texto },
  texto:     { fontSize: 15, color: CORES.texto },
  textoSec:  { fontSize: 14, color: CORES.textoSecundario },
  botao: {
    backgroundColor: CORES.primary, borderRadius: 10,
    paddingVertical: 14, paddingHorizontal: 20,
    alignItems: 'center', marginVertical: 6,
  },
  botaoTexto:  { color: '#FFF', fontSize: 16, fontWeight: '700' },
  botaoPerigo: { backgroundColor: CORES.perigo },
  input: {
    borderWidth: 1, borderColor: CORES.borda, borderRadius: 10,
    padding: 14, fontSize: 15, backgroundColor: CORES.branco, marginVertical: 6,
  },
  label: {
    fontSize: 13, fontWeight: '600', color: CORES.textoSecundario,
    marginBottom: 4, marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5,
  },
});

export function formatarMoeda(valor) {
  return `R$ ${(parseFloat(valor)||0).toFixed(2).replace('.',',')}`;
}

export function formatarDataBR(isoDate) {
  if (!isoDate) return '';
  const [ano, mes, dia] = isoDate.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function hojeISO() {
  return new Date().toISOString().split('T')[0];
}

export function adicionarDias(isoDate, dias) {
  const d = new Date(isoDate + 'T12:00:00');
  d.setDate(d.getDate() + dias);
  return d.toISOString().split('T')[0];
}
