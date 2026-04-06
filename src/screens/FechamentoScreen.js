import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useState } from 'react';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { calcularFechamento } from '../database/db';
import { CORES, estilosGlobais, formatarMoeda, formatarDataBR } from '../components/theme';

export default function FechamentoScreen() {
  const hoje = new Date().toISOString().split('T')[0];
  const [dataInicio, setDataInicio] = useState(hoje.slice(0,8)+'01');
  const [dataFim,    setDataFim]    = useState(hoje);
  const [resultado,  setResultado]  = useState([]);
  const [calculando, setCalculando] = useState(false);

  async function calcular() {
    if (dataInicio > dataFim) return Alert.alert('Datas inválidas','Início deve ser antes do fim.');
    setCalculando(true);
    setResultado(await calcularFechamento(dataInicio, dataFim));
    setCalculando(false);
  }

  function textoIndividual(r) {
    return (
      `🌾 FAZENDA BOA ESPERANÇA\n`+
      `Período: ${formatarDataBR(dataInicio)} a ${formatarDataBR(dataFim)}\n\n`+
      `👤 ${r.nome}${r.apelido?` (${r.apelido})`:''}\n`+
      `✅ Trabalhados: ${r.dias_trabalhados}\n`+
      `❌ Faltas: ${r.faltas}\n`+
      `🔸 Meias: ${r.meias_diarias}\n`+
      `⭐ Extras: ${r.extras}\n\n`+
      `💰 TOTAL: ${formatarMoeda(r.total_pagar)}\n`+
      (r.chave_pix?`🔑 Pix (${r.tipo_chave_pix}): ${r.chave_pix}\n`:'')
    );
  }

  function textoGeral() {
    const total = resultado.reduce((a,r)=>a+r.total_pagar,0);
    let txt = `🌾 FAZENDA BOA ESPERANÇA\nFechamento: ${formatarDataBR(dataInicio)} a ${formatarDataBR(dataFim)}\n\n`;
    resultado.forEach(r=>{
      txt += `• ${r.nome}: ${formatarMoeda(r.total_pagar)} (${r.dias_trabalhados}d, ${r.faltas}F)\n`;
    });
    return txt + `\n💰 TOTAL GERAL: ${formatarMoeda(total)}`;
  }

  async function compartilhar(texto) {
    const uri = FileSystem.cacheDirectory + 'fechamento.txt';
    await FileSystem.writeAsStringAsync(uri, texto, {encoding: FileSystem.EncodingType.UTF8});
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri,{mimeType:'text/plain',dialogTitle:'Compartilhar Fechamento'});
    } else {
      Alert.alert('Fechamento', texto);
    }
  }

  const totalGeral = resultado.reduce((a,r)=>a+r.total_pagar,0);

  return (
    <View style={estilosGlobais.container}>
      <View style={estilosGlobais.card}>
        <Text style={[estilosGlobais.label,{marginTop:0}]}>Período</Text>
        <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
          <View style={{flex:1}}>
            <Text style={estilosGlobais.textoSec}>De</Text>
            <TextInput style={[estilosGlobais.input,{marginVertical:4}]}
              value={dataInicio} onChangeText={setDataInicio}
              placeholder="AAAA-MM-DD" placeholderTextColor={CORES.textoSecundario}/>
          </View>
          <Text style={{fontSize:14,color:CORES.textoSecundario,paddingTop:20}}>até</Text>
          <View style={{flex:1}}>
            <Text style={estilosGlobais.textoSec}>Até</Text>
            <TextInput style={[estilosGlobais.input,{marginVertical:4}]}
              value={dataFim} onChangeText={setDataFim}
              placeholder="AAAA-MM-DD" placeholderTextColor={CORES.textoSecundario}/>
          </View>
        </View>
        <TouchableOpacity style={estilosGlobais.botao} onPress={calcular} disabled={calculando}>
          <Text style={estilosGlobais.botaoTexto}>
            {calculando?'Calculando...':'🧮  Calcular fechamento'}
          </Text>
        </TouchableOpacity>
      </View>

      {resultado.length>0 && (
        <>
          <View style={[estilosGlobais.card,{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}]}>
            <Text style={estilosGlobais.subtitulo}>Total geral</Text>
            <Text style={[estilosGlobais.titulo,{color:CORES.primary}]}>{formatarMoeda(totalGeral)}</Text>
          </View>
          <TouchableOpacity style={[estilosGlobais.botao,{marginHorizontal:16,backgroundColor:CORES.E}]}
            onPress={()=>compartilhar(textoGeral())}>
            <Text style={estilosGlobais.botaoTexto}>📤  Compartilhar resumo geral</Text>
          </TouchableOpacity>
        </>
      )}

      <FlatList
        data={resultado} keyExtractor={r=>String(r.funcionario_id)}
        contentContainerStyle={{paddingBottom:24}}
        renderItem={({item:r}) => (
          <View style={estilosGlobais.card}>
            <Text style={estilosGlobais.subtitulo}>{r.nome}{r.apelido?` (${r.apelido})`:''}</Text>
            <View style={{flexDirection:'row',marginVertical:12}}>
              {[['Trabalhados',r.dias_trabalhados,CORES.P],
                ['Faltas',r.faltas,CORES.F],
                ['Meias',r.meias_diarias,CORES.M],
                ['Extras',r.extras,CORES.E]].map(([l,v,c])=>(
                <View key={l} style={{flex:1,alignItems:'center'}}>
                  <Text style={{fontSize:22,fontWeight:'800',color:c}}>{v}</Text>
                  <Text style={{fontSize:11,color:CORES.textoSecundario,textAlign:'center'}}>{l}</Text>
                </View>
              ))}
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:8}}>
              <View>
                <Text style={estilosGlobais.textoSec}>Total a pagar</Text>
                <Text style={[estilosGlobais.titulo,{color:CORES.primary}]}>{formatarMoeda(r.total_pagar)}</Text>
                {r.chave_pix?<Text style={estilosGlobais.textoSec}>Pix ({r.tipo_chave_pix}): {r.chave_pix}</Text>:null}
              </View>
              <TouchableOpacity style={[estilosGlobais.botao,{paddingVertical:10,paddingHorizontal:14}]}
                onPress={()=>compartilhar(textoIndividual(r))}>
                <Text style={estilosGlobais.botaoTexto}>📤 WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
