import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { listarFuncionarios, excluirFuncionario, atualizarFuncionario } from '../database/db';
import { CORES, estilosGlobais, formatarMoeda } from '../components/theme';

export default function FuncionariosScreen({ navigation }) {
  const [todos, setTodos]         = useState([]);
  const [busca, setBusca]         = useState('');
  const [filtro, setFiltro]       = useState('todos');

  useFocusEffect(useCallback(() => {
    listarFuncionarios().then(setTodos);
  }, []));

  const lista = todos.filter(f => {
    const nome = (f.nome+' '+(f.apelido||'')).toLowerCase();
    const ok   = nome.includes(busca.toLowerCase());
    const fat  = filtro==='todos' || (filtro==='ativos' ? f.ativo : !f.ativo);
    return ok && fat;
  });

  async function toggleAtivo(f) {
    await atualizarFuncionario({...f, ativo: f.ativo ? 0 : 1});
    listarFuncionarios().then(setTodos);
  }

  function confirmarExclusao(f) {
    Alert.alert('Excluir', `Excluir ${f.nome}? Todos os lançamentos serão apagados.`, [
      { text:'Cancelar', style:'cancel' },
      { text:'Excluir', style:'destructive', onPress: async () => {
        await excluirFuncionario(f.id);
        listarFuncionarios().then(setTodos);
      }},
    ]);
  }

  return (
    <View style={estilosGlobais.container}>
      <View style={{ flexDirection:'row', alignItems:'center', padding:16, gap:8 }}>
        <TextInput
          style={[estilosGlobais.input,{flex:1,marginVertical:0}]}
          placeholder="Buscar por nome..."
          value={busca} onChangeText={setBusca}
          placeholderTextColor={CORES.textoSecundario}
        />
        <TouchableOpacity style={estilosGlobais.botao}
          onPress={() => navigation.navigate('Cadastro',{})}>
          <Ionicons name="add" size={24} color="#FFF"/>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection:'row', paddingHorizontal:16, gap:8, marginBottom:8 }}>
        {['todos','ativos','inativos'].map(f => (
          <TouchableOpacity key={f}
            style={{ flex:1, paddingVertical:8, borderRadius:8, alignItems:'center',
              backgroundColor: filtro===f ? CORES.primary : '#EEE' }}
            onPress={() => setFiltro(f)}>
            <Text style={{ fontSize:13, fontWeight:'600', color: filtro===f?'#FFF':CORES.textoSecundario }}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={lista} keyExtractor={f => String(f.id)}
        contentContainerStyle={{ paddingBottom:24 }}
        ListEmptyComponent={
          <Text style={[estilosGlobais.textoSec,{textAlign:'center',marginTop:40}]}>
            Nenhum funcionário encontrado.
          </Text>
        }
        renderItem={({ item: f }) => (
          <View style={[estilosGlobais.card, !f.ativo&&{opacity:0.65}]}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
              <Text style={estilosGlobais.subtitulo}>{f.nome}</Text>
              <View style={{ backgroundColor:f.ativo?CORES.P_BG:'#EEE', borderRadius:6, paddingHorizontal:8, paddingVertical:2 }}>
                <Text style={{ fontSize:12, fontWeight:'700', color:f.ativo?CORES.P:'#999' }}>
                  {f.ativo?'Ativo':'Inativo'}
                </Text>
              </View>
            </View>
            {f.apelido ? <Text style={estilosGlobais.textoSec}>"{f.apelido}"</Text> : null}
            <Text style={[estilosGlobais.textoSec,{marginBottom:12}]}>{f.funcao} · {formatarMoeda(f.valor_diaria)}/dia</Text>
            <View style={{ flexDirection:'row', gap:8 }}>
              <TouchableOpacity
                style={{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center',
                  gap:4, paddingVertical:10, borderRadius:8, backgroundColor:CORES.E_BG }}
                onPress={() => navigation.navigate('Cadastro',{ funcionarioId: f.id })}>
                <Ionicons name="create-outline" size={18} color={CORES.E}/>
                <Text style={{ fontSize:13, fontWeight:'600', color:CORES.E }}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center',
                  gap:4, paddingVertical:10, borderRadius:8,
                  backgroundColor: f.ativo ? CORES.M_BG : CORES.P_BG }}
                onPress={() => toggleAtivo(f)}>
                <Ionicons name={f.ativo?'pause-circle-outline':'play-circle-outline'} size={18}
                  color={f.ativo?CORES.M:CORES.P}/>
                <Text style={{ fontSize:13, fontWeight:'600', color:f.ativo?CORES.M:CORES.P }}>
                  {f.ativo?'Desativar':'Ativar'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center',
                  gap:4, paddingVertical:10, borderRadius:8, backgroundColor:CORES.F_BG }}
                onPress={() => confirmarExclusao(f)}>
                <Ionicons name="trash-outline" size={18} color={CORES.F}/>
                <Text style={{ fontSize:13, fontWeight:'600', color:CORES.F }}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
