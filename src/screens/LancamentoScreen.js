import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { listarFuncionarios, listarLancamentosPorData, salvarLancamento } from '../database/db';
import { CORES, estilosGlobais, formatarDataBR, formatarMoeda, hojeISO, adicionarDias, LABELS_SITUACAO } from '../components/theme';

const SITS = ['P','F','M','E'];

export default function LancamentoScreen({ navigation }) {
  const [data, setData]           = useState(hojeISO());
  const [funcionarios, setFuncs]  = useState([]);
  const [lancamentos, setLancs]   = useState({});
  const [pendentes, setPend]      = useState({});
  const [salvando, setSalvando]   = useState(false);

  useFocusEffect(useCallback(() => { carregar(); }, [data]));

  async function carregar() {
    const funcs = await listarFuncionarios(true);
    const lancs = await listarLancamentosPorData(data);
    const mapa  = {};
    lancs.forEach(l => { mapa[l.funcionario_id] = l; });
    setFuncs(funcs); setLancs(mapa); setPend({});
  }

  async function salvarTodos() {
    setSalvando(true);
    for (const f of funcionarios) {
      const sit = pendentes[f.id]?.situacao || lancamentos[f.id]?.situacao;
      if (!sit) continue;
      const obs = pendentes[f.id]?.observacao || lancamentos[f.id]?.observacao || '';
      await salvarLancamento(data, f.id, sit, f.valor_diaria, 0, obs);
    }
    setSalvando(false);
    await carregar();
    Alert.alert('Salvo!', 'Lançamentos salvos com sucesso.');
  }

  function sitAtual(f) {
    return pendentes[f.id]?.situacao || lancamentos[f.id]?.situacao || null;
  }

  return (
    <View style={estilosGlobais.container}>
      <View style={styles.navData}>
        <TouchableOpacity style={styles.seta} onPress={() => setData(d => adicionarDias(d,-1))}>
          <Ionicons name="chevron-back" size={28} color={CORES.primary}/>
        </TouchableOpacity>
        <Text style={styles.dataTexto}>{formatarDataBR(data)}</Text>
        <TouchableOpacity style={styles.seta} onPress={() => setData(d => adicionarDias(d,1))}>
          <Ionicons name="chevron-forward" size={28} color={CORES.primary}/>
        </TouchableOpacity>
      </View>

      <FlatList
        data={funcionarios}
        keyExtractor={f => String(f.id)}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={[estilosGlobais.textoSec,{textAlign:'center',marginTop:40}]}>
            Nenhum funcionário ativo.
          </Text>
        }
        renderItem={({ item: f }) => {
          const sit = sitAtual(f);
          return (
            <View style={estilosGlobais.card}>
              <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:12 }}>
                <View>
                  <Text style={estilosGlobais.subtitulo}>{f.apelido || f.nome}</Text>
                  <Text style={estilosGlobais.textoSec}>{f.funcao} · {formatarMoeda(f.valor_diaria)}/dia</Text>
                </View>
                {sit && (
                  <TouchableOpacity onPress={() => navigation.navigate('Detalhe',{
                    lancamentoId: lancamentos[f.id]?.id, data, funcionarioId: f.id })}>
                    <View style={{ backgroundColor:CORES[`${sit}_BG`], borderRadius:8, paddingHorizontal:10, paddingVertical:4 }}>
                      <Text style={{ color:CORES[sit], fontSize:13, fontWeight:'700' }}>{LABELS_SITUACAO[sit]}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
              <View style={{ flexDirection:'row', gap:8 }}>
                {SITS.map(s => (
                  <TouchableOpacity key={s}
                    style={{ flex:1, paddingVertical:14, borderRadius:10, alignItems:'center',
                      backgroundColor: sit===s ? CORES[s] : CORES[`${s}_BG`] }}
                    onPress={() => setPend(p => ({...p,[f.id]:{...p[f.id],situacao:s}}))}>
                    <Text style={{ fontSize:18, fontWeight:'800', color: sit===s?'#FFF':CORES[s] }}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity
        style={[estilosGlobais.botao, styles.botaoSalvar]}
        onPress={salvarTodos} disabled={salvando}>
        <Text style={estilosGlobais.botaoTexto}>
          {salvando ? 'Salvando...' : '💾  Salvar Lançamentos'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navData: {
    flexDirection:'row', alignItems:'center', justifyContent:'space-between',
    backgroundColor:CORES.branco, paddingHorizontal:8, paddingVertical:12,
    borderBottomWidth:1, borderBottomColor:CORES.borda,
  },
  seta:      { padding:8 },
  dataTexto: { fontSize:20, fontWeight:'800', color:CORES.texto },
  botaoSalvar: {
    position:'absolute', bottom:16, left:16, right:16,
    elevation:6, shadowColor:'#000', shadowOffset:{width:0,height:3},
    shadowOpacity:0.2, shadowRadius:6,
  },
});
