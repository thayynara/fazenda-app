import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { inserirFuncionario, atualizarFuncionario, buscarFuncionario } from '../database/db';
import { CORES, estilosGlobais } from '../components/theme';

const TIPOS = ['CPF','Telefone','E-mail','Aleatória'];

export default function CadastroScreen({ route, navigation }) {
  const { funcionarioId } = route.params || {};
  const editando = !!funcionarioId;
  const [form, setForm] = useState({
    nome:'', apelido:'', funcao:'', valor_diaria:'',
    chave_pix:'', tipo_chave_pix:'CPF', telefone:'', observacao:'', ativo:1,
  });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (editando) buscarFuncionario(funcionarioId).then(f => {
      if (f) setForm({...f, valor_diaria: String(f.valor_diaria)});
    });
  }, [funcionarioId]);

  const set = (k,v) => setForm(p => ({...p,[k]:v}));

  async function salvar() {
    if (!form.nome.trim()) return Alert.alert('Obrigatório','Informe o nome.');
    const vd = parseFloat(form.valor_diaria.replace(',','.'));
    if (isNaN(vd)||vd<0) return Alert.alert('Inválido','Informe um valor de diária válido.');
    setSalvando(true);
    try {
      const dados = {...form, valor_diaria: vd};
      if (editando) await atualizarFuncionario({...dados, id: funcionarioId});
      else          await inserirFuncionario(dados);
      navigation.goBack();
    } catch(e) {
      Alert.alert('Erro','Não foi possível salvar.');
    } finally { setSalvando(false); }
  }

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
      <ScrollView style={estilosGlobais.container} contentContainerStyle={{padding:16,paddingBottom:40}}>

        <Text style={estilosGlobais.label}>Nome *</Text>
        <TextInput style={estilosGlobais.input} value={form.nome} onChangeText={v=>set('nome',v)}
          placeholder="Nome completo" placeholderTextColor={CORES.textoSecundario}/>

        <Text style={estilosGlobais.label}>Apelido</Text>
        <TextInput style={estilosGlobais.input} value={form.apelido} onChangeText={v=>set('apelido',v)}
          placeholder="Como é chamado" placeholderTextColor={CORES.textoSecundario}/>

        <Text style={estilosGlobais.label}>Função</Text>
        <TextInput style={estilosGlobais.input} value={form.funcao} onChangeText={v=>set('funcao',v)}
          placeholder="Ex: Peão de campo, Tratorista" placeholderTextColor={CORES.textoSecundario}/>

        <Text style={estilosGlobais.label}>Valor da Diária (R$) *</Text>
        <TextInput style={estilosGlobais.input} value={form.valor_diaria} onChangeText={v=>set('valor_diaria',v)}
          placeholder="0,00" keyboardType="decimal-pad" placeholderTextColor={CORES.textoSecundario}/>

        <Text style={estilosGlobais.label}>Tipo da Chave Pix</Text>
        <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:4}}>
          {TIPOS.map(t => (
            <TouchableOpacity key={t}
              style={{paddingHorizontal:14,paddingVertical:10,borderRadius:8,
                backgroundColor:form.tipo_chave_pix===t?CORES.primary:'#EEE'}}
              onPress={()=>set('tipo_chave_pix',t)}>
              <Text style={{fontSize:14,fontWeight:'600',
                color:form.tipo_chave_pix===t?'#FFF':CORES.textoSecundario}}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={estilosGlobais.label}>Chave Pix</Text>
        <TextInput style={estilosGlobais.input} value={form.chave_pix} onChangeText={v=>set('chave_pix',v)}
          placeholder="Chave para pagamento" autoCapitalize="none" placeholderTextColor={CORES.textoSecundario}/>

        <Text style={estilosGlobais.label}>Telefone</Text>
        <TextInput style={estilosGlobais.input} value={form.telefone} onChangeText={v=>set('telefone',v)}
          placeholder="(00) 00000-0000" keyboardType="phone-pad" placeholderTextColor={CORES.textoSecundario}/>

        <Text style={estilosGlobais.label}>Observação</Text>
        <TextInput style={[estilosGlobais.input,{height:80,textAlignVertical:'top'}]}
          value={form.observacao} onChangeText={v=>set('observacao',v)}
          placeholder="Anotações gerais" multiline placeholderTextColor={CORES.textoSecundario}/>

        <TouchableOpacity style={[estilosGlobais.botao,{marginTop:16}]} onPress={salvar} disabled={salvando}>
          <Text style={estilosGlobais.botaoTexto}>
            {salvando ? 'Salvando...' : editando ? '✓  Salvar alterações' : '✓  Cadastrar funcionário'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
