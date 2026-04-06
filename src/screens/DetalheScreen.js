import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { buscarLancamento, salvarLancamento, excluirLancamento, calcularValor, buscarFuncionario } from '../database/db';
import { CORES, estilosGlobais, formatarMoeda, formatarDataBR, LABELS_SITUACAO, hojeISO } from '../components/theme';

const SITS = ['P','F','M','E'];

export default function DetalheScreen({ route, navigation }) {
  const { lancamentoId, data, funcionarioId } = route.params || {};
  const [func, setFunc]           = useState(null);
  const [situacao, setSituacao]   = useState('P');
  const [valorExtra, setExtra]    = useState('');
  const [observacao, setObs]      = useState('');
  const [dataLanc, setDataLanc]   = useState(data || hojeISO());

  useEffect(() => {
    async function carregar() {
      if (lancamentoId) {
        const l = await buscarLancamento(lancamentoId);
        if (l) {
          setSituacao(l.situacao);
          setExtra(l.valor_extra>0 ? String(l.valor_extra) : '');
          setObs(l.observacao||'');
          setDataLanc(l.data);
          setFunc(await buscarFuncionario(l.funcionario_id));
        }
      } else if (funcionarioId) {
        setFunc(await buscarFuncionario(funcionarioId));
      }
    }
    carregar();
  }, [lancamentoId, funcionarioId]);

  const vd    = func?.valor_diaria || 0;
  const extra = parseFloat(valorExtra.replace(',','.')) || 0;
  const total = calcularValor(situacao, vd, extra);

  async function salvar() {
    if (!func) return;
    await salvarLancamento(dataLanc, func.id, situacao, vd, extra, observacao);
    navigation.goBack();
  }

  async function excluir() {
    if (!lancamentoId) return;
    Alert.alert('Excluir lançamento','Confirmar exclusão?',[
      {text:'Cancelar',style:'cancel'},
      {text:'Excluir',style:'destructive', onPress: async()=>{
        await excluirLancamento(lancamentoId);
        navigation.goBack();
      }},
    ]);
  }

  if (!func) return null;

  return (
    <ScrollView style={estilosGlobais.container} contentContainerStyle={{padding:16,paddingBottom:40}}>
      <View style={estilosGlobais.card}>
        <Text style={estilosGlobais.subtitulo}>{func.apelido||func.nome}</Text>
        <Text style={estilosGlobais.textoSec}>{func.funcao} · {formatarDataBR(dataLanc)}</Text>
        <Text style={estilosGlobais.textoSec}>Diária base: {formatarMoeda(vd)}</Text>
      </View>

      <Text style={estilosGlobais.label}>Situação</Text>
      <View style={{flexDirection:'row',gap:8}}>
        {SITS.map(s => (
          <TouchableOpacity key={s}
            style={{flex:1,paddingVertical:14,borderRadius:10,alignItems:'center',
              backgroundColor:situacao===s?CORES[s]:CORES[`${s}_BG`]}}
            onPress={()=>setSituacao(s)}>
            <Text style={{fontSize:20,fontWeight:'800',color:situacao===s?'#FFF':CORES[s]}}>{s}</Text>
            <Text style={{fontSize:11,fontWeight:'600',color:situacao===s?'#FFF':CORES[s]}}>{LABELS_SITUACAO[s]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {situacao==='E' && (
        <>
          <Text style={estilosGlobais.label}>Valor Extra (R$)</Text>
          <TextInput style={estilosGlobais.input} value={valorExtra} onChangeText={setExtra}
            placeholder="0,00" keyboardType="decimal-pad" placeholderTextColor={CORES.textoSecundario}/>
        </>
      )}

      <View style={[estilosGlobais.card,{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}]}>
        <Text style={estilosGlobais.textoSec}>Valor a receber</Text>
        <Text style={{fontSize:26,fontWeight:'800',color:CORES.primary}}>{formatarMoeda(total)}</Text>
      </View>

      <Text style={estilosGlobais.label}>Observação</Text>
      <TextInput style={[estilosGlobais.input,{height:80,textAlignVertical:'top'}]}
        value={observacao} onChangeText={setObs}
        placeholder="Anotação do dia..." multiline placeholderTextColor={CORES.textoSecundario}/>

      <TouchableOpacity style={[estilosGlobais.botao,{marginTop:12}]} onPress={salvar}>
        <Text style={estilosGlobais.botaoTexto}>✓  Salvar lançamento</Text>
      </TouchableOpacity>

      {lancamentoId && (
        <TouchableOpacity style={[estilosGlobais.botao,estilosGlobais.botaoPerigo,{marginTop:8}]} onPress={excluir}>
          <Text style={estilosGlobais.botaoTexto}>Excluir lançamento</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
