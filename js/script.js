// Navegação entre abas
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.getAttribute('data-tab');

    // Remove a classe 'active' de todas as abas e formulários
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.form-section').forEach(form => form.classList.remove('active'));

    // Ativa a aba e o formulário selecionados
    tab.classList.add('active');
    document.getElementById(`form-${target}`).classList.add('active');

    // Limpa resultados e campos ao trocar de aba
    document.getElementById('result').style.display = 'none';
    document.getElementById('result').innerHTML = '';
    document.getElementById('resultados-container').classList.add('hidden');
    document.getElementById('select-resultados').innerHTML = '';
  });
});

// Função para buscar endereço pelo CEP
async function buscarCEP(e) {
  e.preventDefault();
  const cep = document.getElementById('cep').value.replace(/\D/g, '');
  const resultDiv = document.getElementById('result');
  resultDiv.style.display = 'none';
  resultDiv.innerHTML = '';

  // Validação do CEP
  if (cep.length !== 8) {
    alert('CEP inválido. Deve conter 8 dígitos.');
    return;
  }

  try {
    // Consulta a API ViaCEP
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();

    // Verifica se o CEP existe
    if (data.erro) {
      alert('CEP não encontrado.');
      return;
    }

    // Exibe o resultado
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
      <p><strong>CEP:</strong> ${data.cep}</p>
      <p><strong>Logradouro:</strong> ${data.logradouro}</p>
      <p><strong>Complemento:</strong> ${data.complemento || '-'}</p>
      <p><strong>Bairro:</strong> ${data.bairro}</p>
      <p><strong>Cidade:</strong> ${data.localidade}</p>
      <p><strong>Estado:</strong> ${data.uf}</p>
    `;
  } catch (error) {
    console.error(error);
    alert('Erro ao buscar informações do CEP.');
  }
}

// Função para buscar endereços por rua, cidade e estado
async function buscarRuaPorEndereco(e) {
  e.preventDefault();
  const logradouro = document.getElementById('logradouro').value.trim();
  const cidade = document.getElementById('cidade').value.trim();
  const estado = document.getElementById('estado').value.trim().toUpperCase();
  const select = document.getElementById('select-resultados');
  const container = document.getElementById('resultados-container');
  const resultDiv = document.getElementById('result');

  // Limpa resultados anteriores
  resultDiv.style.display = 'none';
  resultDiv.innerHTML = '';
  container.classList.add('hidden');
  select.innerHTML = '';

  // Validações dos campos
  if (logradouro.length < 3) {
    alert('O nome da rua deve ter pelo menos 3 caracteres.');
    return;
  }
  if (cidade.length < 3) {
    alert('O nome da cidade deve ter pelo menos 3 caracteres.');
    return;
  }
  if (!estado || estado.length !== 2) {
    alert('Informe a sigla do estado com 2 letras.');
    return;
  }

  try {
    // Consulta a API ViaCEP
    const res = await fetch(`https://viacep.com.br/ws/${estado}/${cidade}/${logradouro}/json/`);

    if (res.status === 400) {
      alert('Requisição inválida. Verifique os dados informados.');
      return;
    }

    const data = await res.json();

    // Verifica se há resultados
    if (!Array.isArray(data) || data.length === 0) {
      alert('Nenhum resultado encontrado.');
      return;
    }

    // Preenche o select com os resultados encontrados
    container.classList.remove('hidden');
    data.forEach(item => {
      const option = document.createElement('option');
      option.value = JSON.stringify(item);
      option.textContent = `${item.logradouro}, ${item.bairro} - ${item.localidade}/${item.uf}`;
      select.appendChild(option);
    });

  } catch (error) {
    console.error(error);
    alert('Erro ao buscar informações.');
  }
}

// Exibe os detalhes do endereço selecionado no dropdown
function mostrarDetalhes(value) {
  const item = JSON.parse(value);
  const resultDiv = document.getElementById('result');

  resultDiv.style.display = 'block';
  resultDiv.innerHTML = `
    <p><strong>CEP:</strong> ${item.cep}</p>
    <p><strong>Logradouro:</strong> ${item.logradouro}</p>
    <p><strong>Complemento:</strong> ${item.complemento || '-'}</p>
    <p><strong>Bairro:</strong> ${item.bairro}</p>
    <p><strong>Cidade:</strong> ${item.localidade}</p>
    <p><strong>Estado:</strong> ${item.uf}</p>
    <p><strong>IBGE:</strong> ${item.ibge}</p>
  `;
}