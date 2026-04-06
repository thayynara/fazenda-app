import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { resumoDia } from '../database/db';
import { CORES, estilosGlobais, formatarMoeda, formatarDataBR, hojeISO } from '../components/theme';

export default function HomeScreen({ navigation }) {
  const hoje = hojeISO();
  const [resumo, setResumo] = useState({ presentes:0, faltas:0, meias:0, extras:0, total_dia:0 });

  useFocusEffect(useCallback(() => {
    resumoDia(hoje).then(r => r && setResumo(r));
  }, [hoje]));

  const atalhos = [
    { label: 'Lançamento\nDiário',  icon: 'calendar',  cor: CORES.P,    tela: 'Lançamento' },
    { label: 'Funcionários',        icon: 'people',    cor: '#6A1B9A',  tela: 'Funcionários' },
    { label: 'Fechamento',          icon: 'cash',      cor: CORES.E,    tela: 'Fechamento' },
    { label: 'Relatórios',          icon: 'bar-chart', cor: '#E65100',  tela: 'Relatórios' },
  ];

  return (
    <ScrollView style={estilosGlobais.container} contentContainerStyle={{ paddingVertical: 16 }}>
      <View style={estilosGlobais.card}>
        <Text style={[estilosGlobais.subtitulo, { marginBottom: 4 }]}>Resumo de hoje</Text>
        <Text style={[estilosGlobais.textoSec, { marginBottom: 12 }]}>{formatarDataBR(hoje)}</Text>
        <View style={{ flexDirection:'row', justifyContent:'space-around' }}>
          {[['Presentes', resumo.presentes, CORES.P],
            ['Faltas',    resumo.faltas,    CORES.F],
            ['Meias',     resumo.meias,     CORES.M],
            ['Extras',    resumo.extras,    CORES.E]].map(([l,v,c]) => (
            <View key={l} style={{ alignItems:'center', padding:8 }}>
              <Text style={{ fontSize:32, fontWeight:'800', color:c }}>{v}</Text>
              <Text style={estilosGlobais.textoSec}>{l}</Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center',
          borderTopWidth:1, borderTopColor:CORES.borda, paddingTop:12, marginTop:8 }}>
          <Text style={estilosGlobais.textoSec}>Total do dia</Text>
          <Text style={{ fontSize:22, fontWeight:'800', color:CORES.primary }}>{formatarMoeda(resumo.total_dia)}</Text>
        </View>
      </View>

      <Text style={styles.secLabel}>Acesso rápido</Text>
      <View style={{ flexDirection:'row', flexWrap:'wrap', marginHorizontal:12 }}>
        {atalhos.map(a => (
          <TouchableOpacity key={a.tela}
            style={[styles.atalho, { borderTopColor: a.cor }]}
            onPress={() => navigation.navigate(a.tela)}>
            <Ionicons name={a.icon} size={32} color={a.cor} />
            <Text style={[styles.atalhoLabel, { color: a.cor }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  secLabel: {
    fontSize:13, fontWeight:'700', color:CORES.textoSecundario,
    textTransform:'uppercase', letterSpacing:1,
    marginHorizontal:16, marginTop:16, marginBottom:8,
  },
  atalho: {
    width:'46%', margin:'2%', backgroundColor:CORES.branco,
    borderRadius:12, padding:20, alignItems:'center',
    borderTopWidth:4, elevation:2, minHeight:100,
    shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.08, shadowRadius:4,
  },
  atalhoLabel: { fontSize:14, fontWeight:'700', textAlign:'center', marginTop:8 },
});
