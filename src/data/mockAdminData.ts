import type { OrganizationSignupRequest } from '../types/admin';

export const mockOrganizationSignupRequests: OrganizationSignupRequest[] = [
  {
    id: 'req-001',
    email: 'admin@eyeon.com',
    status: 'PENDING',
    createdAt: '2024-05-20T10:30:00Z',
    
    b_no: '1234567890',
    start_dt: '20200101',
    p_nm: '홍길동',
    b_nm: '(주)아이온',
    corp_no: '1101111234567',
    b_adr: '서울특별시 강남구 테헤란로 123',
    
    nts_valid: '01',
    nts_valid_msg: '진위확인 일치',
    nts_status: '계속사업자',
    
    attachmentFileName: '사업자등록증_아이온.pdf',
    attachmentUrl: '#',
  },
  {
    id: 'req-002',
    email: 'contact@testcorp.kr',
    status: 'PENDING',
    createdAt: '2024-05-21T14:15:00Z',
    
    b_no: '0987654321',
    start_dt: '20230515',
    p_nm: '김철수',
    p_nm2: '박영희',
    b_nm: '테스트코퍼레이션',
    
    nts_valid: '02',
    nts_valid_msg: '대표자 성명 불일치',
    nts_status: '계속사업자',
    
    attachmentFileName: 'testcorp_biz_license.png',
    attachmentUrl: '#',
  },
  {
    id: 'req-003',
    email: 'hello@democompany.com',
    status: 'PENDING',
    createdAt: '2024-05-22T09:00:00Z',
    
    b_no: '1112223334',
    start_dt: '20191111',
    p_nm: '이영희',
    b_nm: '데모(주)',
    corp_no: '1101119876543',
    
    nts_valid: '01',
    nts_valid_msg: '진위확인 일치',
    nts_status: '폐업자',
    
    attachmentFileName: '데모주식회사_등록증.jpg',
    attachmentUrl: '#',
  },
];