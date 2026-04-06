import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { calcularRelatorioMensal } from '../database/db';
import { CORES, estilosGlobais, formatarMoeda } from '../components/theme';

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

export default function RelatoriosScreen() {
  const agora = new Date();
  const [ano, setAno]           = useState(agora.getFullYear());
  const [mes, setMes]           = useState(agora.getMonth()+1);
  const [dados, setDados]       = useState([]);
  const [calculando, setCalc]   = useState(false);

  async function calcular() {
    setCalc(true);
    setDados(await calcularRelatorioMensal(ano, mes));
    setCalc(false);
  }

  const totalFolha = dados.reduce((a,r)=>a+r.total_pagar,0);
  const ranking    = [...dados].sort((a,b)=>b.faltas-a.faltas).filter(r=>r.faltas>0);

  return (
    <View style={estilosGlobais.container}>
      <View style={estilosGlobais.card}>
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',marginBottom:12}}>
          <TouchableOpacity onPress={()=>setAno(a=>a-1)} style={{padding:8}}>
            <Text style={{fontSize:28,color:CORES.primary,fontWeight:'800'}}>‹</Text>
          </TouchableOpacity>
          <Text style={{fontSize:22,fontWeight:'800',color:CORES.texto,marginHorizontal:20}}>{ano}</Text>
          <TouchableOpacity onPress={()=>setAno(a=>a+1)} style={{padding:8}}>
            <Text style={{fontSize:28,color:CORES.primary,fontWeight:'800'}}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={{flexDirection:'row',flexWrap:'wrap',gap:6,marginBottom:12}}>
          {MESES.map((m,i)=>(
            <TouchableOpacity key={m}
              style={{width:'23%',paddingVertical:10,borderRadius:8,alignItems:'center',
                backgroundColor:mes===i+1?CORES.primary:'#EEE'}}
              onPress={()=>setMes(i+1)}>
              <Text style={{fontSize:13,fontWeight:'600',
                color:mes===i+1?'#FFF':CORES.textoSecundario}}>{m.slice(0,3)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={estilosGlobais.botao} onPress={calcular} disabled={calculando}>
          <Text style={estilosGlobais.botaoTexto}>
            {calculando?'Calculando...':'📊  Gerar relatório'}
          </Text>
        </TouchableOpacity>
      </View>

      {dados.length>0 && (
        <>
          <View style={[estilosGlobais.card,{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}]}>
            <View>
              <Text style={estilosGlobais.textoSec}>{MESES[mes-1]} {ano}</Text>
              <Text style={estilosGlobais.subtitulo}>Total da folha</Text>
            </View>
            <Text style={[estilosGlobais.titulo,{color:CORES.primary,fontSize:24}]}>{formatarMoeda(totalFolha)}</Text>
          </View>

          {ranking.length>0 && (
            <View style={estilosGlobais.card}>
              <Text style={[estilosGlobais.subtitulo,{marginBottom:10}]}>🚩 Ranking de faltas</Text>
              {ranking.slice(0,5).map((r,i)=>(
                <View key={r.funcionario_id}
                  style={{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:6,
                    borderBottomWidth:1,borderBottomColor:CORES.borda}}>
                  <Text style={{fontSize:16,fontWeight:'800',color:CORES.textoSecundario,width:28}}>{i+1}º</Text>
                  <Text style={[estilosGlobais.texto,{flex:1}]}>{r.nome}</Text>
                  <Text style={[estilosGlobais.subtitulo,{color:CORES.F}]}>{r.faltas}F</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      <FlatList
        data={dados} keyExtractor={r=>String(r.funcionario_id)}
        contentContainerStyle={{paddingBottom:24}}
        renderItem={({item:r})=>(
          <View style={estilosGlobais.card}>
            <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:10}}>
              <Text style={estilosGlobais.subtitulo}>{r.nome}</Text>
              <Text style={[estilosGlobais.subtitulo,{color:CORES.primary}]}>{formatarMoeda(r.total_pagar)}</Text>
            </View>
            <View style={{flexDirection:'row'}}>
              {[['Trabalhados',r.dias_trabalhados,CORES.P],
                ['Faltas',r.faltas,CORES.F],
                ['Meias',r.meias_diarias,CORES.M],
                ['Extras',r.extras,CORES.E]].map(([l,v,c])=>(
                <View key={l} style={{flex:1,alignItems:'center'}}>
                  <Text style={{fontSize:20,fontWeight:'800',color:c}}>{v}</Text>
                  <Text style={{fontSize:11,color:CORES.textoSecundario}}>{l}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      />
    </View>
  );
}
