import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes (cuidado em produção!)
  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.note.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.document.deleteMany();
  await prisma.hearing.deleteMany();
  await prisma.deadline.deleteMany();
  await prisma.party.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.case.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.template.deleteMany();

  // Criar usuários
  const hashedPassword = await bcrypt.hash('senha123', 12);

  const socio = await prisma.user.create({
    data: {
      name: 'Dr. Carlos Silva',
      email: 'carlos@escritorio.com',
      password: hashedPassword,
      cpf: '111.222.333-44',
      oab: 'SP123456',
      phone: '(11) 98765-4321',
      role: 'SOCIO',
    },
  });

  const advogado = await prisma.user.create({
    data: {
      name: 'Dra. Maria Santos',
      email: 'maria@escritorio.com',
      password: hashedPassword,
      cpf: '222.333.444-55',
      oab: 'SP234567',
      phone: '(11) 98765-4322',
      role: 'ADVOGADO',
    },
  });

  const estagiario = await prisma.user.create({
    data: {
      name: 'João Pedro',
      email: 'joao@escritorio.com',
      password: hashedPassword,
      cpf: '333.444.555-66',
      phone: '(11) 98765-4323',
      role: 'ESTAGIARIO',
    },
  });

  console.log('✅ Usuários criados');

  // Criar clientes
  const cliente1 = await prisma.client.create({
    data: {
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 91234-5678',
      cpfCnpj: '123.456.789-00',
      type: 'PESSOA_FISICA',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    },
  });

  const cliente2 = await prisma.client.create({
    data: {
      name: 'Empresa ABC Ltda',
      email: 'contato@abc.com.br',
      phone: '(11) 3456-7890',
      cpfCnpj: '12.345.678/0001-90',
      type: 'PESSOA_JURIDICA',
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
    },
  });

  console.log('✅ Clientes criados');

  // Criar processos
  const case1 = await prisma.case.create({
    data: {
      caseNumber: '1234567-89.2024.8.26.0100',
      title: 'Ação Trabalhista - Horas Extras',
      description: 'Reclamação trabalhista referente a horas extras não pagas.',
      type: 'TRABALHISTA',
      status: 'ATIVO',
      court: '1ª Vara do Trabalho de São Paulo',
      jurisdiction: 'São Paulo - SP',
      judge: 'Dr. José Antonio',
      value: 50000.00,
      clientId: cliente1.id,
      responsibleId: advogado.id,
    },
  });

  const case2 = await prisma.case.create({
    data: {
      caseNumber: '9876543-21.2024.8.26.0100',
      title: 'Ação Civil - Cobrança',
      description: 'Ação de cobrança de valores não pagos.',
      type: 'CIVIL',
      status: 'ATIVO',
      court: '5ª Vara Cível Central',
      jurisdiction: 'São Paulo - SP',
      judge: 'Dra. Ana Paula',
      value: 100000.00,
      clientId: cliente2.id,
      responsibleId: socio.id,
    },
  });

  console.log('✅ Processos criados');

  // Criar prazos
  const prazo1 = await prisma.deadline.create({
    data: {
      title: 'Apresentar Recurso',
      description: 'Recurso Ordinário contra sentença desfavorável',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 dias
      priority: 'ALTA',
      caseId: case1.id,
    },
  });

  const prazo2 = await prisma.deadline.create({
    data: {
      title: 'Contestação',
      description: 'Apresentar contestação da ação',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 dias
      priority: 'URGENTE',
      caseId: case2.id,
    },
  });

  console.log('✅ Prazos criados');

  // Criar audiências
  await prisma.hearing.create({
    data: {
      title: 'Audiência de Conciliação',
      description: 'Primeira audiência - tentativa de acordo',
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 dias
      location: '1ª Vara do Trabalho - Sala 3',
      type: 'INICIAL',
      status: 'AGENDADA',
      caseId: case1.id,
    },
  });

  await prisma.hearing.create({
    data: {
      title: 'Audiência de Instrução',
      description: 'Oitiva de testemunhas',
      date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 dias
      location: '5ª Vara Cível - Sala 5',
      type: 'INSTRUÇÃO',
      status: 'AGENDADA',
      caseId: case2.id,
    },
  });

  console.log('✅ Audiências criadas');

  // Criar honorários
  await prisma.fee.create({
    data: {
      description: 'Honorários Contratuais - Entrada',
      amount: 5000.00,
      dueDate: new Date(),
      status: 'PAGO',
      type: 'HONORARIO',
      caseId: case1.id,
    },
  });

  await prisma.fee.create({
    data: {
      description: 'Honorários Contratuais - Parcela 1',
      amount: 10000.00,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      status: 'PENDENTE',
      type: 'HONORARIO',
      caseId: case2.id,
    },
  });

  console.log('✅ Honorários criados');

  // Criar contratos
  await prisma.contract.create({
    data: {
      title: 'Contrato de Prestação de Serviços Jurídicos',
      description: 'Contrato para representação em processo trabalhista',
      value: 15000.00,
      startDate: new Date(),
      status: 'ATIVO',
      clientId: cliente1.id,
    },
  });

  await prisma.contract.create({
    data: {
      title: 'Contrato de Assessoria Jurídica',
      description: 'Assessoria jurídica mensal',
      value: 5000.00,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
      status: 'ATIVO',
      clientId: cliente2.id,
    },
  });

  console.log('✅ Contratos criados');

  // Criar templates
  await prisma.template.create({
    data: {
      name: 'Petição Inicial - Ação Trabalhista',
      description: 'Template padrão para petição inicial em ações trabalhistas',
      content: `
EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DO TRABALHO DA {VARA} DE {CIDADE}

{NOME_CLIENTE}, {QUALIFICACAO}, vem, respeitosamente, à presença de Vossa Excelência, por meio de seus advogados que esta subscrevem, propor

RECLAMAÇÃO TRABALHISTA

em face de {NOME_RECLAMADO}, {QUALIFICACAO_RECLAMADO}, pelos fatos e fundamentos jurídicos a seguir expostos:

I - DOS FATOS
{DESCRICAO_FATOS}

II - DO DIREITO
{FUNDAMENTACAO_JURIDICA}

III - DOS PEDIDOS
...
      `,
      category: 'PETICAO',
      variables: JSON.stringify(['VARA', 'CIDADE', 'NOME_CLIENTE', 'QUALIFICACAO', 'NOME_RECLAMADO', 'QUALIFICACAO_RECLAMADO', 'DESCRICAO_FATOS', 'FUNDAMENTACAO_JURIDICA']),
    },
  });

  await prisma.template.create({
    data: {
      name: 'Procuração',
      description: 'Template de procuração ad judicia',
      content: `
PROCURAÇÃO

OUTORGANTE: {NOME_CLIENTE}, {NACIONALIDADE}, {ESTADO_CIVIL}, {PROFISSAO}, portador(a) do RG nº {RG} e CPF nº {CPF}, residente e domiciliado(a) em {ENDERECO}

OUTORGADO: {NOME_ADVOGADO}, {NACIONALIDADE}, {ESTADO_CIVIL}, advogado(a), inscrito(a) na OAB/{UF} sob o nº {OAB}

PODERES: Para o foro em geral, com poderes especiais para receber e dar quitação, transigir, desistir, firmar compromisso, confessar, reconhecer a procedência do pedido, receber e dar quitação, substabelecer, tudo quanto necessário for ao bom desempenho do mandato.

{CIDADE}, {DATA}

_________________________
{NOME_CLIENTE}
      `,
      category: 'PROCURACAO',
      variables: JSON.stringify(['NOME_CLIENTE', 'NACIONALIDADE', 'ESTADO_CIVIL', 'PROFISSAO', 'RG', 'CPF', 'ENDERECO', 'NOME_ADVOGADO', 'UF', 'OAB', 'CIDADE', 'DATA']),
    },
  });

  console.log('✅ Templates criados');

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👨‍💼 Sócio:');
  console.log('   Email: carlos@escritorio.com');
  console.log('   Senha: senha123');
  console.log('\n👩‍💼 Advogada:');
  console.log('   Email: maria@escritorio.com');
  console.log('   Senha: senha123');
  console.log('\n👨‍🎓 Estagiário:');
  console.log('   Email: joao@escritorio.com');
  console.log('   Senha: senha123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
