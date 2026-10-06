import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AttachmentListComponent } from '../../shared/components/attachment-list.component';
import { AttachmentService, MAX_ATTACHMENT_BYTES } from './attachment.service';

function fileOfSize(name: string, size: number): File {
  return new File([new Uint8Array(size)], name);
}

describe('AttachmentService', () => {
  let service: AttachmentService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(AttachmentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('accepts a file at the 5 MB limit', () => {
    expect(service.validate(fileOfSize('ok.pdf', MAX_ATTACHMENT_BYTES))).toBeNull();
  });

  it('rejects a file over 5 MB with a message naming the file', () => {
    const message = service.validate(fileOfSize('big.pdf', MAX_ATTACHMENT_BYTES + 1));

    expect(message).toContain('big.pdf');
    expect(message).toContain('5 MB');
  });

  it('rejects an empty file', () => {
    expect(service.validate(fileOfSize('empty.txt', 0))).toContain('empty.txt');
  });

  it('filterValid keeps valid files and reports each rejected one', () => {
    const rejected: string[] = [];
    const valid = fileOfSize('a.txt', 10);
    const files = [valid, fileOfSize('big.bin', MAX_ATTACHMENT_BYTES + 1), fileOfSize('empty.txt', 0)];

    expect(service.filterValid(files, (message) => rejected.push(message))).toEqual([valid]);
    expect(rejected.length).toBe(2);
  });

  it('filterValid with no files returns nothing and reports nothing', () => {
    const rejected: string[] = [];

    expect(service.filterValid([], (message) => rejected.push(message))).toEqual([]);
    expect(rejected).toEqual([]);
  });

  it('uploads the file as multipart form data', () => {
    const file = fileOfSize('doc.pdf', 20);
    const result = { fileId: 'f1', originalName: 'doc.pdf', extension: '.pdf', fileSize: 20 };
    let uploaded: unknown;
    service.upload(file, 'u1').subscribe((info) => uploaded = info);

    const request = http.expectOne('/api/attachments');
    expect(request.request.method).toBe('POST');
    expect(request.request.body instanceof FormData).toBeTrue();
    expect((request.request.body as FormData).get('file')).toEqual(file);
    expect((request.request.body as FormData).get('uploadedBy')).toBe('u1');
    request.flush(result);

    expect(uploaded).toEqual(result);
  });

  it('uploadAll with no files makes no request', () => {
    let uploaded: unknown;
    service.uploadAll([], 'u1').subscribe((infos) => uploaded = infos);

    http.expectNone('/api/attachments');
    expect(uploaded).toEqual([]);
  });

  it('uploadAll fails the whole batch when one upload fails', () => {
    let failed = false;
    service.uploadAll([fileOfSize('a.txt', 1), fileOfSize('b.txt', 1)], 'u1').subscribe({ error: () => failed = true });

    const requests = http.match('/api/attachments');
    requests[0].flush({ fileId: 'a', originalName: 'a.txt', extension: '.txt', fileSize: 1 });
    requests[1].flush({ message: 'File size must not exceed 5 MB.' }, { status: 400, statusText: 'Bad Request' });

    expect(failed).toBeTrue();
  });

  it('errorMessage prefers the API message and falls back otherwise', () => {
    expect(service.errorMessage({ error: { message: 'Too big' } })).toBe('Too big');
    expect(service.errorMessage({}, 'fallback')).toBe('fallback');
    expect(service.errorMessage(null, 'fallback')).toBe('fallback');
  });

  it('getInfo caches lookups and returns null for a missing file', () => {
    const results: unknown[] = [];
    service.getInfo('gone').subscribe((info) => results.push(info));
    service.getInfo('gone').subscribe((info) => results.push(info));

    http.expectOne('/api/attachments/gone/info').flush(null, { status: 404, statusText: 'Not Found' });

    expect(results).toEqual([null, null]);
  });

  it('getInfo propagates central service failures instead of treating them as missing files', () => {
    let status = 0;
    service.getInfo('broken').subscribe({
      error: (error) => status = error.status
    });
    http.expectOne('/api/attachments/broken/info').flush(
      { title: 'Bad Gateway' },
      { status: 502, statusText: 'Bad Gateway' }
    );

    expect(status).toBe(502);
  });

  it('builds an encoded download url', () => {
    expect(service.downloadUrl('a b')).toBe('/api/attachments/a%20b');
  });
});

describe('AttachmentListComponent', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule, AttachmentListComponent] });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function render(fileIds: string | string[]) {
    const fixture = TestBed.createComponent(AttachmentListComponent);
    fixture.componentInstance.fileIds = fileIds;
    fixture.componentInstance.ngOnChanges();
    fixture.detectChanges();
    return fixture;
  }

  it('shows a download link with the original name for an existing attachment', () => {
    const fixture = render('abc,def');
    http.expectOne('/api/attachments/abc/info').flush({ fileId: 'abc', originalName: 'report.pdf', extension: '.pdf', fileSize: 1 });
    http.expectOne('/api/attachments/def/info').flush({ fileId: 'def', originalName: 'notes.txt', extension: '.txt', fileSize: 1 });
    fixture.detectChanges();

    const links = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];
    expect(links.map((link) => link.textContent?.trim())).toEqual(['report.pdf', 'notes.txt']);
    expect(links[0].getAttribute('href')).toBe('/api/attachments/abc');
    expect(links[0].getAttribute('download')).toBe('report.pdf');
  });

  it('shows a non-clickable item when the file is missing on the server', () => {
    const fixture = render(['gone']);
    http.expectOne('/api/attachments/gone/info').flush(null, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('a')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('gone');
  });

  it('renders nothing and makes no request without ids', () => {
    const fixture = render('');

    expect(fixture.nativeElement.querySelector('a')).toBeNull();
    http.expectNone(() => true);
  });
});
