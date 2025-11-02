import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed completo do banco de dados...\n');

  // Limpar dados existentes
  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.template.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.document.deleteMany();
  await prisma.hearing.deleteMany();
  await prisma.deadline.deleteMany();
  await prisma.note.deleteMany();
  await prisma.party.deleteMany();
  await prisma.case.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Dados antigos removidos\n');

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
      name: 'João Pedro Oliveira',
      email: 'joao@escritorio.com',
      password: hashedPassword,
      cpf: '333.444.555-66',
      phone: '(11) 98765-4323',
      role: 'ESTAGIARIO',
    },
  });

  console.log('✅ Usuários criados');

  // Criar 10 clientes
  const clientesData = [
    {
      name: 'João da Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 91234-5678',
      cpfCnpj: '123.456.789-00',
      type: 'PESSOA_FISICA' as const,
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    },
    {
      name: 'Maria Oliveira',
      email: 'maria.oliveira@email.com',
      phone: '(11) 91234-5679',
      cpfCnpj: '234.567.890-11',
      type: 'PESSOA_FISICA' as const,
      address: 'Av. Paulista, 500',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
    },
    {
      name: 'Empresa TechSolutions Ltda',
      email: 'contato@techsolutions.com',
      phone: '(11) 3456-7890',
      cpfCnpj: '12.345.678/0001-90',
      type: 'PESSOA_JURIDICA' as const,
      address: 'Rua dos Tecnólogos, 456',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04567-890',
    },
    {
      name: 'Pedro Santos',
      email: 'pedro.santos@email.com',
      phone: '(11) 91234-5680',
      cpfCnpj: '345.678.901-22',
      type: 'PESSOA_FISICA' as const,
      address: 'Rua Augusta, 789',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01305-100',
    },
    {
      name: 'Construtora BuildMax S/A',
      email: 'juridico@buildmax.com.br',
      phone: '(11) 3456-7891',
      cpfCnpj: '23.456.789/0001-01',
      type: 'PESSOA_JURIDICA' as const,
      address: 'Av. Industrial, 2000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '02345-678',
    },
    {
      name: 'Ana Paula Costa',
      email: 'ana.costa@email.com',
      phone: '(11) 91234-5681',
      cpfCnpj: '456.789.012-33',
      type: 'PESSOA_FISICA' as const,
      address: 'Rua da Consolação, 1500',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01302-000',
    },
    {
      name: 'Comércio Varejo ABC Ltda',
      email: 'contato@varejoabc.com',
      phone: '(11) 3456-7892',
      cpfCnpj: '34.567.890/0001-12',
      type: 'PESSOA_JURIDICA' as const,
      address: 'Rua do Comércio, 350',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '03456-789',
    },
    {
      name: 'Roberto Almeida',
      email: 'roberto.almeida@email.com',
      phone: '(11) 91234-5682',
      cpfCnpj: '567.890.123-44',
      type: 'PESSOA_FISICA' as const,
      address: 'Alameda Santos, 2500',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01419-002',
    },
    {
      name: 'Indústria MetalCorp Ltda',
      email: 'contato@metalcorp.ind.br',
      phone: '(11) 3456-7893',
      cpfCnpj: '45.678.901/0001-23',
      type: 'PESSOA_JURIDICA' as const,
      address: 'Rua Industrial, 1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '04567-000',
    },
    {
      name: 'Fernanda Lima',
      email: 'fernanda.lima@email.com',
      phone: '(11) 91234-5683',
      cpfCnpj: '678.901.234-55',
      type: 'PESSOA_FISICA' as const,
      address: 'Rua Oscar Freire, 1200',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01426-001',
    },
  ];

  const clientes = await Promise.all(
    clientesData.map(data => prisma.client.create({ data }))
  );

  console.log('✅ 10 Clientes criados');

  // Criar 4+ processos variados
  const casesData = [
    {
      caseNumber: '1001234-56.2024.8.26.0100',
      title: 'Ação Trabalhista - Horas Extras',
      description: 'Reclamação trabalhista por horas extras não pagas',
      type: 'TRABALHISTA' as const,
      status: 'ATIVO' as const,
      court: 'Tribunal Regional do Trabalho - 2ª Região',
      jurisdiction: 'São Paulo',
      judge: 'Dr. Ricardo Mendes',
      value: 45000,
      clientId: clientes[0].id,
      responsibleId: advogado.id,
    },
    {
      caseNumber: '2002345-67.2024.8.26.0000',
      title: 'Ação de Cobrança - Inadimplência Contratual',
      description: 'Cobrança de valores não pagos referentes a contrato de prestação de serviços',
      type: 'CIVIL' as const,
      status: 'ATIVO' as const,
      court: 'Foro Central Cível',
      jurisdiction: 'São Paulo',
      judge: 'Dra. Mariana Silva',
      value: 120000,
      clientId: clientes[2].id,
      responsibleId: socio.id,
    },
    {
      caseNumber: '3003456-78.2024.8.26.0100',
      title: 'Divórcio Consensual',
      description: 'Processo de divórcio consensual com partilha de bens',
      type: 'FAMILIA' as const,
      status: 'ATIVO' as const,
      court: 'Vara de Família',
      jurisdiction: 'São Paulo',
      judge: 'Dra. Patricia Rocha',
      value: 0,
      clientId: clientes[1].id,
      responsibleId: advogado.id,
    },
    {
      caseNumber: '4004567-89.2024.8.26.0576',
      title: 'Ação de Indenização por Danos Morais',
      description: 'Indenização por danos morais decorrentes de acidente de trânsito',
      type: 'CIVIL' as const,
      status: 'ATIVO' as const,
      court: 'Foro Regional de São Miguel Paulista',
      jurisdiction: 'São Paulo',
      judge: 'Dr. Fernando Costa',
      value: 80000,
      clientId: clientes[3].id,
      responsibleId: socio.id,
    },
    {
      caseNumber: '5005678-90.2024.403.6100',
      title: 'Execução Fiscal - Débitos Tributários',
      description: 'Execução fiscal para cobrança de débitos tributários não pagos',
      type: 'TRIBUTARIO' as const,
      status: 'ARQUIVADO' as const,
      court: 'Justiça Federal - 3ª Vara',
      jurisdiction: 'São Paulo',
      judge: 'Dr. Alexandre Barbosa',
      value: 250000,
      clientId: clientes[4].id,
      responsibleId: advogado.id,
    },
    {
      caseNumber: '6006789-01.2024.8.26.0100',
      title: 'Inventário e Partilha',
      description: 'Processo de inventário e partilha de bens',
      type: 'FAMILIA' as const,
      status: 'ATIVO' as const,
      court: 'Vara de Família e Sucessões',
      jurisdiction: 'São Paulo',
      judge: 'Dra. Juliana Martins',
      value: 0,
      clientId: clientes[5].id,
      responsibleId: advogado.id,
    },
    {
      caseNumber: '7007890-12.2024.8.26.0100',
      title: 'Revisão de Aluguel Comercial',
      description: 'Ação para revisão de valores de aluguel comercial',
      type: 'CIVIL' as const,
      status: 'ATIVO' as const,
      court: 'Vara Cível',
      jurisdiction: 'São Paulo',
      judge: 'Dr. Paulo Henrique',
      value: 0,
      clientId: clientes[6].id,
      responsibleId: socio.id,
    },
    {
      caseNumber: '8008901-23.2024.8.26.0000',
      title: 'Ação Declaratória - Nulidade Contratual',
      description: 'Declaração de nulidade de cláusulas contratuais abusivas',
      type: 'CIVIL' as const,
      status: 'SUSPENSO' as const,
      court: 'Foro Central',
      jurisdiction: 'São Paulo',
      judge: 'Dra. Sandra Lima',
      value: 0,
      clientId: clientes[7].id,
      responsibleId: advogado.id,
    },
    {
      caseNumber: '9009012-34.2024.5.02.0000',
      title: 'Reclamação Trabalhista - Rescisão Indireta',
      description: 'Rescisão indireta do contrato de trabalho',
      type: 'TRABALHISTA' as const,
      status: 'ATIVO' as const,
      court: 'TRT 2ª Região',
      jurisdiction: 'São Paulo',
      judge: 'Dra. Carla Ribeiro',
      value: 95000,
      clientId: clientes[8].id,
      responsibleId: socio.id,
    },
    {
      caseNumber: '1010123-45.2024.8.26.0100',
      title: 'Ação de Despejo por Falta de Pagamento',
      description: 'Despejo de inquilino por falta de pagamento de aluguéis',
      type: 'CIVIL' as const,
      status: 'ATIVO' as const,
      court: 'Vara Cível',
      jurisdiction: 'São Paulo',
      judge: 'Dr. Marcos Vieira',
      value: 0,
      clientId: clientes[9].id,
      responsibleId: advogado.id,
    },
  ];

  const cases = await Promise.all(
    casesData.map(data => prisma.case.create({ data }))
  );

  console.log('✅ 10 Processos criados');

  // Criar prazos para cada processo
  const now = new Date();
  const deadlinesData: any[] = [];
  
  cases.forEach((caso, index) => {
    const baseDays = index * 5;
    deadlinesData.push(
      {
        title: 'Contestação',
        description: 'Prazo para apresentar contestação',
        dueDate: new Date(now.getTime() + (15 + baseDays) * 24 * 60 * 60 * 1000),
        priority: 'ALTA' as const,
        isCompleted: false,
        caseId: caso.id,
      },
      {
        title: 'Juntada de Documentos',
        description: 'Prazo para juntar documentos complementares',
        dueDate: new Date(now.getTime() + (10 + baseDays) * 24 * 60 * 60 * 1000),
        priority: 'MEDIA' as const,
        isCompleted: false,
        caseId: caso.id,
      }
    );
  });

  await Promise.all(
    deadlinesData.map(data => prisma.deadline.create({ data }))
  );

  console.log('✅ Prazos criados');

  // Criar audiências
  const hearingsData: any[] = [];
  cases.forEach((caso, index) => {
    if (caso.status === 'ATIVO') {
      hearingsData.push({
        title: 'Audiência de Conciliação',
        description: 'Tentativa de acordo entre as partes',
        date: new Date(now.getTime() + (20 + index * 7) * 24 * 60 * 60 * 1000),
        location: caso.court,
        type: 'Conciliação',
        status: 'AGENDADA',
        caseId: caso.id,
      });
    }
  });

  await Promise.all(
    hearingsData.map(data => prisma.hearing.create({ data }))
  );

  console.log('✅ Audiências criadas');

  // Criar honorários para cada cliente
  const feesData: any[] = [];
  clientes.forEach((cliente, index) => {
    const casosCliente = cases.filter(c => c.clientId === cliente.id);
    casosCliente.forEach(caso => {
      feesData.push({
        description: `Honorários advocatícios - ${caso.title}`,
        amount: 5000 + (index * 1000),
        dueDate: new Date(now.getTime() + (30 + index * 5) * 24 * 60 * 60 * 1000),
        status: index % 3 === 0 ? 'PAGO' : (index % 3 === 1 ? 'PENDENTE' : 'ATRASADO'),
        type: 'HONORARIO',
        caseId: caso.id,
      });
    });
  });

  await Promise.all(
    feesData.map(data => prisma.fee.create({ data }))
  );

  console.log('✅ Honorários criados');

  // Criar documentos (7-9 por cliente)
  const documentsData: any[] = [];
  const documentTypes = [
    'PETICAO', 'CONTRATO', 'PROCURACAO', 'ATA', 
    'PARECER', 'OUTROS'
  ];

  clientes.forEach((cliente, clientIndex) => {
    const casosCliente = cases.filter(c => c.clientId === cliente.id);
    const numDocs = 7 + (clientIndex % 3); // 7 a 9 documentos
    
    for (let i = 0; i < numDocs; i++) {
      const caso = casosCliente[i % casosCliente.length];
      if (caso) {
        documentsData.push({
          title: `${documentTypes[i % documentTypes.length]} - ${cliente.name}`,
          description: `Documento relacionado ao processo ${caso.caseNumber}`,
          type: documentTypes[i % documentTypes.length],
          fileName: `doc_${clientIndex}_${i}.pdf`,
          filePath: `/uploads/documents/doc_${clientIndex}_${i}.pdf`,
          fileSize: 150000 + (i * 10000),
          mimeType: 'application/pdf',
          version: 1,
          caseId: caso.id,
          uploadedBy: advogado.id,
        });
      }
    }
  });

  await Promise.all(
    documentsData.map(data => prisma.document.create({ data }))
  );

  console.log('✅ Documentos criados');

  // Criar compromissos na agenda
  const appointmentsData: any[] = [];
  [socio, advogado].forEach((user, userIndex) => {
    for (let i = 0; i < 10; i++) {
      appointmentsData.push({
        title: `Reunião com Cliente ${i + 1}`,
        description: `Discussão sobre andamento do processo`,
        startTime: new Date(now.getTime() + (i + userIndex * 10) * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + (i + userIndex * 10) * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
        location: 'Escritório',
        type: 'REUNIAO' as const,
        userId: user.id,
      });
    }
  });

  await Promise.all(
    appointmentsData.map(data => prisma.appointment.create({ data }))
  );

  console.log('✅ Compromissos criados');

  // Criar contratos
  const contractsData: any[] = [];
  clientes.forEach((cliente, index) => {
    const casosCliente = cases.filter(c => c.clientId === cliente.id);
    if (casosCliente.length > 0) {
      contractsData.push({
        title: `Contrato de Prestação de Serviços Jurídicos - ${cliente.name}`,
        description: 'Contrato de honorários advocatícios',
        value: 10000 + (index * 2000),
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 335 * 24 * 60 * 60 * 1000),
        status: 'ATIVO' as const,
        filePath: `/uploads/contracts/contrato_${cliente.id}.pdf`,
        clientId: cliente.id,
      });
    }
  });

  await Promise.all(
    contractsData.map(data => prisma.contract.create({ data }))
  );

  console.log('✅ Contratos criados');

  // Criar templates de documentos
  const templatesData = [
    {
      name: 'Petição Inicial - Ação de Cobrança',
      description: 'Template padrão para petição inicial de ação de cobrança',
      content: 'Excelentíssimo Senhor Doutor Juiz de Direito...',
      category: 'PETICAO',
    },
    {
      name: 'Contestação - Ação Trabalhista',
      description: 'Template para contestação em processos trabalhistas',
      content: 'MM. Juiz do Trabalho...',
      category: 'PETICAO',
    },
    {
      name: 'Procuração Ad Judicia',
      description: 'Procuração com poderes para representação judicial',
      content: 'PROCURAÇÃO...',
      category: 'PROCURACAO',
    },
    {
      name: 'Contrato de Honorários',
      description: 'Contrato padrão de prestação de serviços jurídicos',
      content: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS JURÍDICOS...',
      category: 'CONTRATO',
    },
  ];

  await Promise.all(
    templatesData.map(data => prisma.template.create({ data }))
  );

  console.log('✅ Templates criados');

  // Criar notificações de exemplo
  const notificationsData = [
    {
      title: 'Prazo Urgente',
      message: 'O prazo do processo 0001234-56.2024.8.19.0001 vence hoje!',
      type: 'PRAZO',
      isRead: false,
      userId: socio.id,
      link: '/deadlines',
    },
    {
      title: 'Audiência Amanhã',
      message: 'Audiência marcada para amanhã às 14h - Processo Trabalhista',
      type: 'AUDIENCIA',
      isRead: false,
      userId: socio.id,
      link: '/calendar',
    },
    {
      title: 'Pagamento Recebido',
      message: 'Honorário de R$ 5.000,00 foi recebido do cliente João Silva',
      type: 'PAGAMENTO',
      isRead: true,
      userId: socio.id,
      link: '/fees',
    },
    {
      title: 'Novo Documento',
      message: 'Nova petição foi adicionada ao processo 0002345-67.2024.8.19.0001',
      type: 'DOCUMENTO',
      isRead: false,
      userId: advogado.id,
      link: '/documents',
    },
    {
      title: 'Cliente Aguardando Retorno',
      message: 'Maria Santos está aguardando retorno sobre seu processo',
      type: 'CLIENTE',
      isRead: false,
      userId: advogado.id,
      link: '/clients',
    },
  ];

  await Promise.all(
    notificationsData.map(data => prisma.notification.create({ data }))
  );

  console.log('✅ Notificações criadas');

  console.log('\n🎉 Seed completo finalizado com sucesso!');
  console.log('\n📊 Resumo:');
  console.log(`   - 3 Usuários`);
  console.log(`   - 10 Clientes`);
  console.log(`   - 10 Processos`);
  console.log(`   - ${deadlinesData.length} Prazos`);
  console.log(`   - ${hearingsData.length} Audiências`);
  console.log(`   - ${feesData.length} Honorários`);
  console.log(`   - ${documentsData.length} Documentos`);
  console.log(`   - ${appointmentsData.length} Compromissos`);
  console.log(`   - ${contractsData.length} Contratos`);
  console.log(`   - 4 Templates`);
  console.log(`   - ${notificationsData.length} Notificações\n`);

  console.log('👤 Credenciais de acesso:');
  console.log('   Email: carlos@escritorio.com | Senha: senha123 (Sócio)');
  console.log('   Email: maria@escritorio.com | Senha: senha123 (Advogado)');
  console.log('   Email: joao@escritorio.com | Senha: senha123 (Estagiário)\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
