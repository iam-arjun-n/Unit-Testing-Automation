const cds = require("@sap/cds");
const { SalesPricingService } = require("../srv/service");
const SequenceHelper = require("../srv/lib/SequenceHelper");

// ---- Mocks ----
jest.mock("@sap/cds", () => ({
  connect: {
    to: jest.fn()
  },
  ApplicationService: class {
    before(event, entity, handler) {
      this._beforeHandler = handler;
    }
    async init() {}
  }
}));

jest.mock("../srv/lib/SequenceHelper");

describe("SalesPricingService - before CREATE SalesPricingRequests", () => {
  let service;
  let mockDb;
  let mockSeqInstance;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockDb = {};
    cds.connect.to.mockResolvedValue(mockDb);

    mockSeqInstance = {
      getNextRequestId: jest.fn().mockResolvedValue("REQ_1001")
    };
    SequenceHelper.mockImplementation(() => mockSeqInstance);

    service = new SalesPricingService();
    service.entities = {
      SalesPricingRequests: "SalesPricingRequests"
    };

    await service.init();
  });

  test("should set requestId and keep Draft status when workflowStatus is Draft", async () => {
    const req = {
      data: {
        workflowStatus: "Draft"
      }
    };

    await service._beforeHandler(req);

    expect(SequenceHelper).toHaveBeenCalledWith({
      db: mockDb,
      table: "COM_DELOITTE_MDG_SALES_PRICING_SALESPRICINGREQUESTS"
    });

    expect(req.data.requestId).toBe("REQ_1001");
    expect(req.data.requestStatus).toBe("Draft");
    expect(req.data.workflowStatus).toBe("Draft");
  });

  test("should set Submitted and InApproval when workflowStatus is not Draft", async () => {
    const req = {
      data: {
        workflowStatus: "SomethingElse"
      }
    };

    await service._beforeHandler(req);

    expect(req.data.requestId).toBe("REQ_1001");
    expect(req.data.requestStatus).toBe("Submitted");
    expect(req.data.workflowStatus).toBe("InApproval");
  });

  test("should call getNextRequestId exactly once", async () => {
    const req = {
      data: {
        workflowStatus: "Draft"
      }
    };

    await service._beforeHandler(req);

    expect(mockSeqInstance.getNextRequestId).toHaveBeenCalledTimes(1);
  });
});
