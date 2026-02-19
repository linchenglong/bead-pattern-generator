/**
 * Auto-generated built-in image library
 * Using Unsplash free images with CORS support
 */

export interface BuiltInImage {
  id: string;
  url: string;
  thumb: string;
  name: string;
}

export interface ImageCategory {
  id: string;
  name: string;
  icon: string;
  images: BuiltInImage[];
}

function unsplash(photoId: string, name: string): BuiltInImage {
  return {
    id: photoId,
    url: `https://images.unsplash.com/photo-${photoId}?w=800&fit=crop&auto=format`,
    thumb: `https://images.unsplash.com/photo-${photoId}?w=200&h=200&fit=crop&auto=format&q=60`,
    name,
  };
}

const PETS: BuiltInImage[] = [
  unsplash('1514888286974-6c03e2ca1dba', '橘猫凝视'),
  unsplash('1573865526739-10659fec78a5', '灰猫端坐'),
  unsplash('1495360010541-f48722b34f7d', '猫咪特写'),
  unsplash('1526336024174-e58f5cdd8e13', '白猫蓝眼'),
  unsplash('1574158622682-e40e69881006', '小猫仰望'),
  unsplash('1587300003388-59208cc962cb', '微笑柴犬'),
  unsplash('1543466835-00a7907e9de1', '金毛犬'),
  unsplash('1548199973-03cce0bbc87b', '草地金毛'),
  unsplash('1552053831-71594a27632d', '可爱柯基'),
  unsplash('1583511655857-d19b40a7a54e', '哈士奇'),
  unsplash('1585110396000-c9ffd4e4b308', '白兔'),
  unsplash('1548767797-d8c844163c4c', '小仓鼠'),
  unsplash('1518882174711-1de40238921b', '猫咪打哈欠'),
  unsplash('1560807707-8cc77767d783', '趴着的狗'),
  unsplash('1537151625747-768eb6cf92b2', '可爱小猫'),
];

const ANIME: BuiltInImage[] = [
  unsplash('1578632767115-351597cf2477', '霓虹街道'),
  unsplash('1533158326339-7f3cf2404354', '赛博朋克城'),
  unsplash('1534972195531-d756b9bfa9f2', '彩色涂鸦墙'),
  unsplash('1752070522773-dbf492cc52c6', '东京霓虹夜'),
  unsplash('1560419015-7c427e8ae5ba', '彩虹糖果色'),
  unsplash('1513364776144-60967b0f800f', '彩色烟雾'),
  unsplash('1557672172-298e090bd0f1', '抽象渐变'),
  unsplash('1550684848-fac1c5b4e853', '粉紫星空'),
  unsplash('1579546929518-9e396f3cc809', '星云宇宙'),
  unsplash('1541701494587-cb58502866ab', '流体艺术'),
  unsplash('1563089145-599997674d42', '几何彩色'),
  unsplash('1518998053901-5348d3961a04', '日本灯笼'),
  unsplash('1528360983277-13d401cdc186', '彩色气球'),
  unsplash('1507003211169-0a1dd7228f2d', '波普艺术'),
  unsplash('1569982175971-d92b01cf8694', '日系建筑'),
];

const SCENERY: BuiltInImage[] = [
  unsplash('1506905925346-21bda4d32df4', '雪山日出'),
  unsplash('1464822759023-fed622ff2c3b', '巍峨雪山'),
  unsplash('1507525428034-b723cf961d3e', '热带沙滩'),
  unsplash('1505118380757-91f5f5632de0', '蔚蓝大海'),
  unsplash('1495616811223-4d98c6e9c869', '壮丽日落'),
  unsplash('1448375240586-882707db888b', '翠绿森林'),
  unsplash('1439066615861-d1af74d74000', '静谧湖泊'),
  unsplash('1470071459604-3b5ec3a7fe05', '绿野仙踪'),
  unsplash('1659290598156-07810ac0ed23', '星空银河'),
  unsplash('1469474968028-56623f02e42e', '绚丽极光'),
  unsplash('1472214103451-9374bd1c798e', '层峦叠嶂'),
  unsplash('1627841849651-2f80be5db524', '金色麦田'),
  unsplash('1418065460487-3e41a6c84dc5', '樱花大道'),
  unsplash('1490730141103-6cac27aaab94', '秋日红叶'),
  unsplash('1433086966358-54859d0ed716', '瀑布飞流'),
];

const FLOWERS: BuiltInImage[] = [
  unsplash('1455659817273-f96807779a8a', '向日葵'),
  unsplash('1664879379124-4ec1ebd3b3b6', '薰衣草田'),
  unsplash('1487530811176-3780de880c2d', '彩色郁金香'),
  unsplash('1444930694458-01babf71870c', '樱花'),
  unsplash('1508610048659-a06b669e3321', '红色罂粟'),
  unsplash('1468327768560-75b778cbb551', '白色雏菊'),
  unsplash('1416879595882-3373a0480b5b', '紫色绣球'),
  unsplash('1457089328109-e5d9bd499191', '水仙花'),
  unsplash('1467545159547-1b93b24406ae', '粉色牡丹'),
];

const FOOD: BuiltInImage[] = [
  unsplash('1565958011703-44f9829ba187', '草莓蛋糕'),
  unsplash('1551024601-bec78aea704b', '彩虹甜甜圈'),
  unsplash('1563729784474-d77dbb933a9e', '马卡龙'),
  unsplash('1567306226416-28f0efdc88ce', '水果拼盘'),
  unsplash('1488477181946-6428a0291777', '寿司拼盘'),
  unsplash('1504674900247-0877df9cc836', '意面'),
  unsplash('1546069901-ba9599a7e63c', '披萨'),
  unsplash('1571091718767-18b5b1457add', '汉堡'),
  unsplash('1495147466023-ac5c588e2e94', '冰淇淋'),
  unsplash('1599536837271-f3e08bd0fac5', '奶茶'),
  unsplash('1540420773420-3366772f4999', '三文鱼'),
  unsplash('1551882547-ff40c63fe5fa', '甜品塔'),
];

export const IMAGE_CATEGORIES: ImageCategory[] = [
  { id: 'pets', name: '萌宠', icon: '🐱', images: PETS },
  { id: 'anime', name: '二次元/插画', icon: '🎨', images: ANIME },
  { id: 'scenery', name: '风景', icon: '🏔️', images: SCENERY },
  { id: 'flowers', name: '花卉', icon: '🌸', images: FLOWERS },
  { id: 'food', name: '美食', icon: '🍰', images: FOOD },
];
