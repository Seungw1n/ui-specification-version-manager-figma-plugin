const fs = require('fs');
const path = require('path');

/**
 * 와이어프레임 구조 파일에서 Description JSON 템플릿을 생성합니다.
 * DESCRIPTION_TEMPLATE.md 양식을 따라 기본 구조를 만듭니다.
 */
function createDescriptionFromWireframe(wireframeFilePath) {
    console.log(`🔧 Description 생성 시작: ${path.basename(wireframeFilePath)}`);
    
    try {
        // 1. 와이어프레임 파일 읽기
        const wireframeData = loadWireframeFile(wireframeFilePath);
        
        // 2. 메타데이터 추출
        const metadata = extractMetadata(wireframeData, wireframeFilePath);
        
        // 3. Description JSON 생성 
        const descriptionContent = createDescriptionJSON(metadata, wireframeData);
        
        // 4. 파일 저장
        const outputPath = saveDescriptionFile(descriptionContent, wireframeFilePath, metadata);
        
        console.log(`✅ Description 생성 완료: ${path.basename(outputPath)}`);
        return outputPath;
        
    } catch (error) {
        console.error(`❌ Description 생성 실패: ${error.message}`);
        throw error;
    }
}

/**
 * 와이어프레임 파일을 읽어서 JSON 파싱
 */
function loadWireframeFile(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`파일을 찾을 수 없습니다: ${filePath}`);
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
}

/**
 * 파일에서 메타데이터 정보 추출
 */
function extractMetadata(wireframeData, filePath) {
    const fileName = wireframeData.fileName || 'Unknown';
    const pageName = wireframeData.pageName || 'v1.0.0';
    const frameName = wireframeData.frameName || 'Unknown';
    
    // 화면 번호 추출 (파일명에서 nn-nn-nn 또는 nn 패턴)
    const baseName = path.basename(filePath);
    const screenNumberMatch = baseName.match(/(\d{2}(?:-\d{2}-\d{2})?)/);
    const categoryNumber = screenNumberMatch ? screenNumberMatch[1].split('-')[0] : '00';
    
    return {
        fileName,
        pageName,
        frameName,
        categoryNumber,
        sourceFile: baseName
    };
}

/**
 * DESCRIPTION_TEMPLATE.md 양식에 따라 Description JSON 생성
 */
function createDescriptionJSON(metadata, wireframeData) {
    const currentTime = new Date().toISOString();
    const { fileName, pageName, frameName, categoryNumber, sourceFile } = metadata;
    
    // 화면 ID 생성 (frameName에서 추출 또는 기본값)
    const screenId = frameName.replace(/_wireframe_.*/, '');
    const screenKey = `${screenId}_description_v1.0.0`;
    
    // 기본 Description 구조 생성
    const descriptionContent = {
        metadata: {
            fileName,
            pageName,
            categoryNumber,
            version: "v1.0.0",
            createdAt: currentTime,
            updatedAt: currentTime.split('T')[0], // YYYY-MM-DD 형식
            sourceWireframes: [sourceFile]
        },
        screens: {
            [screenKey]: {
                title: generateDefaultTitle(frameName),
                outline: generateDefaultOutline(frameName),
                elements: generateDefaultElements(wireframeData.structure)
            }
        }
    };
    
    return descriptionContent;
}

/**
 * 기본 제목 생성
 */
function generateDefaultTitle(frameName) {
    return frameName
        .replace(/^\d{2}-\d{2}-\d{2}_/, '') // 화면번호 제거
        .replace(/_?wireframe_?.*/, '') // wireframe 문자 제거
        .replace(/_/g, ' ') // 언더스코어를 공백으로
        .trim() || '화면 제목';
}

/**
 * 기본 개요 생성
 */
function generateDefaultOutline(frameName) {
    const cleanName = generateDefaultTitle(frameName);
    return `${cleanName}에 대한 상세한 기능 설명과 사용자 시나리오를 작성해주세요.`;
}

/**
 * 와이어프레임 구조를 분석하여 기본 elements 생성
 */
function generateDefaultElements(structure) {
    const elements = {};
    
    if (!structure || !structure.layers) {
        // 구조 정보가 없으면 기본 템플릿 제공
        elements["1"] = {
            content: "[주요 영역] 화면의 주요 구성 요소에 대한 설명을 작성해주세요."
        };
        return elements;
    }
    
    // depth 1인 주요 프레임들을 elements로 변환
    const mainFrames = structure.layers.filter(layer => 
        (layer.type === 'FRAME' || layer.type === 'GROUP') && 
        layer.depth === 1
    );
    
    mainFrames.forEach((frame, index) => {
        const elementId = (index + 1).toString();
        elements[elementId] = {
            content: `[${frame.name}] 이 영역의 기능과 포함된 UI 요소들에 대해 상세히 설명해주세요.`
        };
    });
    
    // 주요 프레임이 없으면 독립 텍스트들을 사용
    if (mainFrames.length === 0) {
        const textLayers = structure.layers.filter(layer => 
            layer.type === 'TEXT' && layer.depth === 1
        );
        
        textLayers.forEach((textLayer, index) => {
            const elementId = (index + 1).toString();
            elements[elementId] = {
                content: `[${textLayer.name}] ${textLayer.currentText || '텍스트 내용'}`
            };
        });
    }
    
    // elements가 비어있으면 기본값 제공
    if (Object.keys(elements).length === 0) {
        elements["1"] = {
            content: "[기본 영역] 이 화면의 주요 기능에 대해 설명해주세요."
        };
    }
    
    return elements;
}

/**
 * Description JSON 파일을 저장
 * 케이스 1: 단일 와이어프레임 - wireframe을 description으로 변경
 * 케이스 2: ZIP 파일 - description_{버전명}.json 형식
 */
function saveDescriptionFile(content, wireframeFilePath, metadata) {
    const outputDir = path.dirname(wireframeFilePath);
    const wireframeBaseName = path.basename(wireframeFilePath, '.json');

    let outputFileName;

    // 케이스 1: 단일 와이어프레임 파일인 경우 - wireframe을 description으로 변경
    if (wireframeBaseName.includes('wireframe')) {
        outputFileName = wireframeBaseName.replace('wireframe', 'description') + '.json';
    }
    // 케이스 2: ZIP 형식의 복수 와이어프레임 파일인 경우 - description_{버전명}.json 형식
    else {
        const version = metadata.pageName || 'v1.0.0';
        outputFileName = `description_${version}.json`;
    }

    const outputPath = path.join(outputDir, outputFileName);

    fs.writeFileSync(outputPath, JSON.stringify(content, null, 2), 'utf8');

    return outputPath;
}

// 모듈 내보내기
module.exports = { createDescriptionFromWireframe };

// CLI 실행 처리
if (require.main === module) {
    const wireframeFile = process.argv[2];
    
    if (!wireframeFile) {
        console.log(`
📝 Description JSON 생성 도구

사용법:
  node create-description.js <와이어프레임파일경로>

예시:
  node create-description.js ./wireframes/01-00-00_wireframe_v1.0.0.json
        `);
        process.exit(1);
    }
    
    createDescriptionFromWireframe(wireframeFile);
}