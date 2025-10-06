const fs = require('fs');
const path = require('path');
const { createDescriptionFromWireframe } = require('./create-description');

/**
 * Claude Code 및 CLI에서 사용할 수 있는 Description 생성 헬퍼 도구
 * 다양한 방식으로 와이어프레임 파일을 검색하고 Description JSON을 생성합니다.
 */

/**
 * 특정 폴더에서 와이어프레임 파일을 찾아서 Description 생성
 */
function findAndCreateDescription(folderPath, frameName = null) {
    console.log(`🔍 폴더 검색: ${folderPath}`);
    
    try {
        validateDirectory(folderPath);
        const targetFile = findWireframeFile(folderPath, frameName);
        const wireframeFilePath = path.join(folderPath, targetFile);
        
        console.log(`📄 와이어프레임 발견: ${targetFile}`);
        return createDescriptionFromWireframe(wireframeFilePath);
        
    } catch (error) {
        console.error(`❌ 폴더 검색 실패: ${error.message}`);
        throw error;
    }
}

/**
 * ui-description 폴더 구조에서 특정 경로의 Description 생성
 * 경로 형식: ui-description/{projectName}/{pageName}/{frameName}
 */
function createDescriptionFromPath(projectName, pageName, frameName) {
    console.log(`🗂️ 구조화된 경로 검색: ${projectName}/${pageName}/${frameName}`);
    
    const folderPath = path.join(__dirname, 'ui-description', projectName, pageName);
    return findAndCreateDescription(folderPath, frameName);
}

/**
 * 지정된 경로에서 가장 최근에 수정된 와이어프레임으로 Description 생성
 */
function createDescriptionFromLatest(searchPath = process.cwd()) {
    console.log(`🕒 최신 파일 검색: ${searchPath}`);
    
    try {
        const wireframeFiles = findAllWireframeFiles(searchPath);
        
        if (wireframeFiles.length === 0) {
            throw new Error(`${searchPath}에서 와이어프레임 파일을 찾을 수 없습니다.`);
        }
        
        // 수정 시간 기준으로 정렬하여 최신 파일 선택
        const latestFile = wireframeFiles.sort((a, b) => b.mtime - a.mtime)[0];
        
        console.log(`📅 최신 파일: ${path.basename(latestFile.path)} (${latestFile.mtime.toLocaleString()})`);
        return createDescriptionFromWireframe(latestFile.path);
        
    } catch (error) {
        console.error(`❌ 최신 파일 검색 실패: ${error.message}`);
        throw error;
    }
}

// === 유틸리티 함수들 ===

/**
 * 디렉토리 존재 여부 확인
 */
function validateDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
        throw new Error(`폴더를 찾을 수 없습니다: ${dirPath}`);
    }
    
    if (!fs.statSync(dirPath).isDirectory()) {
        throw new Error(`경로가 폴더가 아닙니다: ${dirPath}`);
    }
}

/**
 * 폴더에서 와이어프레임 파일 찾기
 */
function findWireframeFile(folderPath, frameName = null) {
    const files = fs.readdirSync(folderPath).filter(file => 
        file.endsWith('.json') && 
        !file.includes('description') &&
        (file.includes('wireframe') || !frameName) // wireframe이 포함되거나 frameName이 지정되지 않은 경우
    );
    
    if (files.length === 0) {
        throw new Error(`${folderPath}에서 와이어프레임 파일을 찾을 수 없습니다.`);
    }
    
    // 특정 프레임명이 지정된 경우 해당 파일 찾기
    if (frameName) {
        const targetFile = files.find(file => 
            file.includes(frameName) || 
            file === `${frameName}.json` ||
            file.startsWith(frameName)
        );
        
        if (!targetFile) {
            throw new Error(`"${frameName}"에 해당하는 와이어프레임 파일을 찾을 수 없습니다. 발견된 파일: ${files.join(', ')}`);
        }
        
        return targetFile;
    }
    
    // 프레임명이 지정되지 않은 경우 첫 번째 파일 사용
    return files[0];
}

/**
 * 지정된 경로에서 모든 와이어프레임 파일을 재귀적으로 검색
 */
function findAllWireframeFiles(rootPath) {
    const wireframeFiles = [];
    
    function searchDirectory(dirPath) {
        try {
            const items = fs.readdirSync(dirPath);
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    // 하위 디렉토리 재귀 검색
                    searchDirectory(fullPath);
                } else if (isWireframeFile(item)) {
                    // 와이어프레임 파일 발견
                    wireframeFiles.push({
                        path: fullPath,
                        name: item,
                        mtime: stat.mtime
                    });
                }
            }
        } catch (error) {
            console.warn(`⚠️ 디렉토리 접근 실패: ${dirPath} (${error.message})`);
        }
    }
    
    searchDirectory(rootPath);
    return wireframeFiles;
}

/**
 * 파일이 와이어프레임 파일인지 확인
 */
function isWireframeFile(fileName) {
    return fileName.endsWith('.json') && 
           !fileName.includes('description') && 
           (fileName.includes('wireframe') || fileName.match(/^\d{2}-\d{2}-\d{2}_/));
}

// 모듈 내보내기
module.exports = {
    findAndCreateDescription,
    createDescriptionFromPath,
    createDescriptionFromLatest,
    createDescriptionFromWireframe // create-description.js에서 가져온 함수 재내보내기
};

// CLI 실행 처리
if (require.main === module) {
    const command = process.argv[2];
    
    try {
        switch (command) {
            case 'folder':
                handleFolderCommand();
                break;
                
            case 'path':
                handlePathCommand();
                break;
                
            case 'latest':
                handleLatestCommand();
                break;
                
            default:
                showUsage();
                process.exit(1);
        }
    } catch (error) {
        console.error(`❌ 실행 실패: ${error.message}`);
        process.exit(1);
    }
}

// CLI 명령어 핸들러들
function handleFolderCommand() {
    const [, , , folderPath, frameName] = process.argv;
    
    if (!folderPath) {
        console.error('❌ 폴더 경로를 지정해주세요.');
        console.log('사용법: node claude-description-helper.js folder <폴더경로> [프레임명]');
        process.exit(1);
    }
    
    findAndCreateDescription(folderPath, frameName);
}

function handlePathCommand() {
    const [, , , projectName, pageName, frameName] = process.argv;
    
    if (!projectName || !pageName || !frameName) {
        console.error('❌ 모든 매개변수를 입력해주세요.');
        console.log('사용법: node claude-description-helper.js path <프로젝트명> <페이지명> <프레임명>');
        process.exit(1);
    }
    
    createDescriptionFromPath(projectName, pageName, frameName);
}

function handleLatestCommand() {
    const searchPath = process.argv[3] || process.cwd();
    createDescriptionFromLatest(searchPath);
}

function showUsage() {
    console.log(`
🔧 Claude Description Helper - 와이어프레임에서 Description JSON 생성

사용법:
  node claude-description-helper.js <명령어> [옵션...]

명령어:
  folder <폴더경로> [프레임명]     지정된 폴더에서 와이어프레임 검색
  path <프로젝트명> <페이지명> <프레임명>  구조화된 경로에서 검색
  latest [검색경로]              가장 최근 수정된 와이어프레임 사용

예시:
  node claude-description-helper.js folder ./wireframes
  node claude-description-helper.js folder ./wireframes 01-00-00
  node claude-description-helper.js path test-project-1 v1.0.0 01-00-00
  node claude-description-helper.js latest ./ui-description

설명:
  - 각 명령어는 찾은 와이어프레임에서 Description JSON 템플릿을 생성합니다
  - DESCRIPTION_TEMPLATE.md 양식을 따라 표준화된 구조를 만듭니다
  - 생성된 파일은 와이어프레임과 같은 폴더에 저장됩니다
    `);
}