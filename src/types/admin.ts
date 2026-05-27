export type OrganizationSignupStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface OrganizationSignupRequest {
  id: string;
  email: string;
  status: OrganizationSignupStatus;
  createdAt: string;

  // 1. 국세청 API 진위확인 요청 데이터 (Request)
  b_no: string;       // 사업자등록번호 (필수)
  start_dt: string;   // 개업일자 (필수, YYYYMMDD)
  p_nm: string;       // 대표자성명 (필수)
  p_nm2?: string;     // 공동대표자성명 (선택)
  b_nm?: string;      // 상호 (선택)
  corp_no?: string;   // 법인등록번호 (선택)
  b_adr?: string;     // 사업장주소 (선택)

  // 2. 국세청 API 진위확인 결과 데이터 (Response)
  nts_valid?: string;      // 진위확인 결과 코드 (예: "01": 일치, "02": 불일치)
  nts_valid_msg?: string;  // 진위확인 결과 메시지
  nts_status?: string;     // 사업자 상태 (예: 계속사업자, 휴업자, 폐업자 등)

  // 3. 첨부파일 데이터
  attachmentFileName?: string; // 업로드된 파일명
  attachmentUrl?: string;      // 파일 다운로드 URL
}
