// 피그마 플러그인 - UI 정의서 적용 및 와이어프레임 추출
figma.showUI(__html__, { width: 440, height: 664 });

figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case 'check-selection':
      handleCheckSelection();
      break;
    case 'read-selected':
      await handleReadSelected();
      break;
    case 'read-wireframes':
      await handleReadWireframes();
      break;
    case 'apply':
      await handleApplyDescription(msg.descriptionData);
      break;
  }
};

// 프레임 선택 여부 확인
function handleCheckSelection() {
  const selection = figma.currentPage.selection;
  const selectedFrames = selection.filter(node => node.type === "FRAME");
  
  figma.ui.postMessage({
    type: 'selection-checked',
    hasSelection: selectedFrames.length > 0
  });
}

// 선택된 프레임들의 구조 읽기
async function handleReadSelected() {
  try {
    const selection = figma.currentPage.selection;
    const selectedFrames = selection.filter(node => node.type === "FRAME");
    
    const screens = selectedFrames.map(frame => extractFrameStructure(frame));
    const structureData = createStructureData(screens);
    
    figma.ui.postMessage({
      type: 'save-structure',
      data: structureData
    });
    
    figma.notify(`✅ ${screens.length}개 화면의 구조를 읽어왔습니다!`);
  } catch (error) {
    figma.notify("❌ 피그마 구조 읽기 실패");
    console.error('Error reading selected frames:', error);
  }
}

// 모든 와이어프레임 구조 읽기
async function handleReadWireframes() {
  try {
    const wireframeFrames = figma.currentPage.findAll(node => 
      node.type === "FRAME" && node.name.toLowerCase().includes("wireframe")
    );
    
    if (wireframeFrames.length === 0) {
      figma.notify("❌ 'wireframe'이 포함된 프레임을 찾을 수 없습니다!");
      return;
    }
    
    const screens = wireframeFrames.map(frame => extractFrameStructure(frame));
    const structureData = createStructureData(screens);
    
    figma.ui.postMessage({
      type: 'save-structure',
      data: structureData
    });
    
    figma.notify(`✅ ${screens.length}개 와이어프레임의 구조를 읽어왔습니다!`);
  } catch (error) {
    figma.notify("❌ 와이어프레임 구조 읽기 실패");
    console.error('Error reading wireframes:', error);
  }
}

// Description JSON 적용 (기존 번호-content 텍스트만 업데이트)
async function handleApplyDescription(descriptionData) {
  try {
    if (!descriptionData || !descriptionData.screens) {
      figma.notify("❌ 올바른 description 파일 형식이 아닙니다.");
      return;
    }
    
    let totalUpdatedCount = 0;
    
    for (const [screenFrameName, screenData] of Object.entries(descriptionData.screens)) {
      console.log(`Looking for frame: ${screenFrameName}`);
      
      // description 프레임 찾기
      const descriptionFrame = figma.currentPage.findOne(node => 
        node.type === "FRAME" && node.name === screenFrameName
      );
      
      if (!descriptionFrame) {
        console.log(`❌ Frame not found: ${screenFrameName}`);
        continue;
      }
      
      console.log(`✓ Found frame: ${descriptionFrame.name}`);
      
      // title, outline, updatedAt 업데이트
      totalUpdatedCount += await updateBasicFields(descriptionFrame, screenData, descriptionData.metadata);
      
      // elements의 번호-content 텍스트들 업데이트
      if (screenData.elements) {
        totalUpdatedCount += await updateElementContents(descriptionFrame, screenData.elements);
      }
    }
    
    if (totalUpdatedCount > 0) {
      figma.notify(`✅ ${totalUpdatedCount}개 텍스트 업데이트 완료!`);
    } else {
      figma.notify("❌ 일치하는 description 프레임을 찾을 수 없습니다.");
    }
    
  } catch (error) {
    figma.notify("❌ 처리 중 오류가 발생했습니다.");
    console.error('Apply error:', error);
  }
}

// 프레임 구조 추출
function extractFrameStructure(frame) {
  const layers = [];
  
  function collectLayers(node, depth = 0) {
    const layerInfo = {
      name: node.name,
      type: node.type,
      depth: depth
    };
    
    if (node.type === "TEXT") {
      layerInfo.currentText = node.characters;
    } else if (node.type === "FRAME" || node.type === "GROUP") {
      layerInfo.children = node.children ? node.children.length : 0;
    }
    
    layers.push(layerInfo);
    
    // 하위 노드들 재귀 처리
    if ('children' in node) {
      node.children.forEach(child => collectLayers(child, depth + 1));
    }
  }
  
  if ('children' in frame) {
    frame.children.forEach(child => collectLayers(child, 1));
  }
  
  return {
    name: frame.name,
    type: "FRAME",
    layers: layers
  };
}

// 구조 데이터 생성
function createStructureData(screens) {
  return {
    fileName: figma.root.name,
    pageName: figma.currentPage.name,
    screens: screens,
    totalScreens: screens.length,
    timestamp: new Date().toISOString()
  };
}

// 기본 필드(title, outline, updatedAt) 업데이트
async function updateBasicFields(descriptionFrame, screenData, metadata) {
  let updatedCount = 0;
  const frameTextNodes = descriptionFrame.findAll(node => node.type === "TEXT");
  
  // title 업데이트
  const titleNodes = frameTextNodes.filter(node => node.name === "title");
  for (const node of titleNodes) {
    if (await updateTextNode(node, screenData.title || "")) {
      updatedCount++;
    }
  }
  
  // outline 업데이트
  const outlineNodes = frameTextNodes.filter(node => node.name === "outline");
  for (const node of outlineNodes) {
    if (await updateTextNode(node, screenData.outline || "")) {
      updatedCount++;
    }
  }
  
  // updatedAt 업데이트 (metadata에서 가져옴)
  if (metadata && metadata.updatedAt) {
    const updatedAtNodes = frameTextNodes.filter(node => node.name === "updatedAt");
    for (const node of updatedAtNodes) {
      // ISO 형식을 YYYY-MM-DD 형식으로 변환
      const formattedDate = metadata.updatedAt.includes('T') 
        ? metadata.updatedAt.split('T')[0] 
        : metadata.updatedAt;
      
      if (await updateTextNode(node, formattedDate)) {
        console.log(`✓ Updated updatedAt: ${formattedDate}`);
        updatedCount++;
      }
    }
  }
  
  return updatedCount;
}

// elements의 번호-content 텍스트들 업데이트 (기존 텍스트만)
async function updateElementContents(descriptionFrame, elements) {
  let updatedCount = 0;
  
  // description 프레임 내의 모든 텍스트 노드 찾기
  const allTextNodes = descriptionFrame.findAll(node => node.type === "TEXT");
  
  for (const [elementId, elementData] of Object.entries(elements)) {
    const contentNodeName = `${elementId}-content`;
    
    // 기존 번호-content 텍스트 노드 찾기
    const contentTextNode = allTextNodes.find(node => node.name === contentNodeName);
    
    if (contentTextNode) {
      // 기존 텍스트 노드가 있으면 내용만 업데이트
      if (await updateTextNode(contentTextNode, elementData.content || "")) {
        console.log(`✓ Updated existing: ${contentNodeName}`);
        updatedCount++;
      }
    } else {
      console.log(`⚠️ Text node not found: ${contentNodeName} (텍스트 생성은 지원하지 않습니다)`);
    }
  }
  
  return updatedCount;
}

// 텍스트 노드 업데이트 헬퍼 함수
async function updateTextNode(textNode, content) {
  try {
    await figma.loadFontAsync(textNode.fontName || { family: "Roboto", style: "Regular" });
    textNode.characters = content;
    return true;
  } catch (error) {
    console.error(`❌ Error updating text node ${textNode.name}:`, error);
    return false;
  }
}
