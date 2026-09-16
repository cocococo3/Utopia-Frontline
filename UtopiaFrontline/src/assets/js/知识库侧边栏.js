setup.questDefs = {
  task1: {
    title: '前往7楼的人事部',
    type: 'main',
    desc: '前往7楼的人事部报到。',
    details: '你需要前往7楼的人事部进行登记和报到。',
    objectives: ['前往7楼的人事部'],
    rewards: []
  },
  task2: {
    title: '弄清触碰怪物时产生的异常',
    type: 'main',
    desc: '你触碰怪物后产生了异常反应，需要找出原因。',
    details: '你意识到触碰怪物后身体出现了异常，但清道夫们却没有，和她们交流或许能找到问题的根源；你的处理器还有些不灵光，或许去5楼的维修部找Carmel打听一下是不错的解决方案。',
    objectives: [
      '与清道夫们交流，了解她们为何没有异常',
      '去5楼维修部找Carmel打听处理器问题'
    ],
    rewards: []
  },
  task3: {
    title: '保护自己不被打扰',
    type: 'main',
    desc: '寻找能保护你免受怪物干扰的道具。',
    details: '去清道夫休息室寻找保护你免受怪物干扰的道具。',
    objectives: ['前往清道夫休息室寻找防护道具'],
    rewards: []
  },
  task31: {
    title: '安息之地',
    type: 'main',
    desc: '向Shaterra打听怪物连接的原因。',
    details: '通过和清道夫的交流，你知道管理安息之地的人形Shaterra似乎和你一样，曾经和怪物建立过连接，或许你可以向她打听造成这一切的原因。',
    objectives: [
      '前往安息之地找到Shaterra',
      '向Shaterra打听怪物连接的原因'
    ],
    rewards: []
  },
  task4: {
    title: '调查奇怪的影像',
    type: 'side',
    desc: '调查出现在你头脑中的奇怪影像。',
    details: '那些出现在你头脑中的信息似乎并不是凭空出现和被捏造出来的，你推测它们有迹可循，但你该如何下手呢？',
    objectives: ['找到调查奇怪影像的线索', '追踪影像的来源'],
    rewards: []
  },
  task41: {
    title: '了解有关怪物的历史',
    type: 'side',
    desc: '了解怪物的历史信息。',
    details: 'Corrina说处理间样本室的芯片里存有怪物历史信息，或许你可以从这方面入手去了解它们。',
    objectives: ['前往处理间样本室获取芯片'],
    rewards: []
  },
  task411: {
    title: '找个办法读取你手中的芯片',
    type: 'side',
    desc: '你获取到了处理间的芯片，但你没法直接读取它们。',
    details: '你获取到了处理间的芯片，但是你没法直接读取它们，或许你需要一些特殊的设备……？',
    objectives: ['找到能读取芯片的设备'],
    rewards: []
  },
  task5: {
    title: '前往化工部寻找防护漆的配方',
    type: 'main',
    desc: '重启防护漆流水线，获得稳定来源。',
    details: '能够保护你免受怪物干扰的防护漆已经停产了很久，你需要前往化工部，重启曾经的流水线，这样你才能有稳定的防护漆来源。',
    objectives: ['前往化工部', '找到防护漆的配方', '重启防护漆流水线'],
    rewards: ['防护漆（稳定来源）']
  },
  task6: {
    title: '获取足够制作防护漆的材料',
    type: 'main',
    desc: '收集制作防护漆所需的材料。',
    details: '流水线已经重启，但要持续生产防护漆，你还需要收集足够的原材料。',
    objectives: ['收集制作防护漆的材料'],
    rewards: []
  },
  task7: {
    title: '探索可以被使用的通风口',
    type: 'side',
    desc: '探索大楼中可利用的通风口。',
    details: '你注意到大楼里有一些通风口似乎可以被利用，或许值得去探索一番。',
    objectives: ['探索通风口'],
    rewards: []
  }
};
//成就
setup.achievementDefs = {
  ach_first_contact: {
    title: '初次接触',
    desc: '第一次触碰怪物',
    icon: '🤝'
  },
  ach_report_in: {
    title: '新人报到',
    desc: '完成人事部报到',
    icon: '📋'
  },
  ach_work_level_two:{
    title:'小试牛刀',
    desc:'工作等级初次达到2级',
    icon:''
  },
  ach_work_level_five:{
    title:'全新境界',
    desc:'工作等级初次达到5级',
    icon:''
  },
  ach_work_level_six:{
    title:'更进一步',
    desc:'工作等级初次达到6级',
    icon:''
  },
  ach_work_level_eight:{
    title:'管理区老手',
    desc:'工作等级初次达到8级',
    icon:''
  },
  ach_work_level_ten:{
    title:'鞠躬尽瘁',
    desc:'工作等级初次达到10级',
    icon:''
  },
  ach_vent:{
    title:'洞中之鼠',
    desc:'探索所有管理区能通行的通风管道',
    icon:''
  },
  ach_normal_end:{
    title:'全新的开始',
    desc:'接过世界端口的管理权，开始新的轮回',
    icon:''
  },
  ach_bad_end:{
    title:'命运的车轮',
    desc:'你拒绝了你的命运，但无法逃离它',
    icon:''
  },
  ach_open_end:{
    title:'逃出生天',
    desc:'关闭世界端口，带领人形回到地上',
    icon:''
  },
  ach_electric_book:{
    title:'历史的痕迹',
    desc:'收集所有芯片',
    icon:''
  },
  ach_fighter:{
    title:'战士',
    desc:'在无外援的情况下斩杀10只怪物',
    icon:''
  }
};